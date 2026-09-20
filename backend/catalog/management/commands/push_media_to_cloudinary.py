import os
from pathlib import Path
from urllib.parse import urlparse

import cloudinary
from django.conf import settings
from django.core.files.base import File
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand, CommandError

from catalog.models import ProductImage


class Command(BaseCommand):
    help = (
        "Upload existing local media files to Cloudinary and repoint the "
        "database at the uploaded copies. Run after setting CLOUDINARY_URL."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="List what would be uploaded without changing anything.",
        )
        parser.add_argument(
            "--proxy",
            default=None,
            help=(
                "HTTP(S) proxy for Cloudinary uploads. Defaults to the "
                "HTTPS_PROXY / https_proxy environment variable."
            ),
        )
        parser.add_argument(
            "--fix-urls",
            action="store_true",
            help=(
                "Strip the MEDIA_URL prefix from rows that already point at "
                "Cloudinary (no upload happens, database only)."
            ),
        )
        parser.add_argument(
            "--restore-local-names",
            action="store_true",
            help=(
                "Repoint image rows at the real file that exists in MEDIA_ROOT "
                "(e.g. products/2/x.png instead of a stale suffixed name). "
                "Does not upload."
            ),
        )

    def handle(self, *args, **options):
        # Configure Cloudinary explicitly from the settings URL: the global
        # cloudinary.config() may have been built before .env was loaded, so
        # don't rely on it having picked up the credentials.
        url = settings.CLOUDINARY_URL or os.environ.get("CLOUDINARY_URL")
        if url:
            parsed = urlparse(url)
            creds = {
                "cloud_name": parsed.hostname,
                "api_key": parsed.username,
                "api_secret": parsed.password,
            }
            cloudinary.config(**{k: v for k, v in creds.items() if v})

        proxy = options["proxy"] or os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
        if proxy:
            cloudinary.config(api_proxy=proxy)
            # uploader._http is built once, at cloudinary.uploader import time
            # (which happens during django setup), so a plain config() is too
            # late. Rebuild it as a proxy manager while we still can.
            from cloudinary import uploader as cloudinary_uploader

            cloudinary_uploader._http = cloudinary.utils.get_http_connector(
                cloudinary.config(), cloudinary.CERT_KWARGS
            )

        if options["fix_urls"]:
            self._fix_url_prefixes(options)
            return

        if options["restore_local_names"]:
            self._restore_local_names(options)
            return

        storage = default_storage
        if storage.__class__.__name__ != "MediaCloudinaryStorage":
            raise CommandError(
                "Default storage is not Cloudinary. Set CLOUDINARY_URL "
                "(e.g. in backend/.env) and reload before running this command."
            )

        media_root = Path(settings.MEDIA_ROOT)
        dry_run = options["dry_run"]

        uploaded = skipped = missing = 0
        for image in ProductImage.objects.all().iterator():
            name = image.image.name
            if not name:
                skipped += 1
                continue

            local = media_root / name
            if not local.exists():
                self.stdout.write(self.style.WARNING(f"missing local file: {name}"))
                missing += 1
                continue

            if dry_run:
                self.stdout.write(f"would upload: {name}")
                uploaded += 1
                continue

            with local.open("rb") as handle:
                new_name = storage.save(name, File(handle))

            if new_name != name:
                image.image.name = new_name
                image.save(update_fields=["image"])

            self.stdout.write(self.style.SUCCESS(f"uploaded: {name} -> {new_name}"))
            uploaded += 1

        action = "Would upload" if dry_run else "Uploaded"
        self.stdout.write(
            self.style.SUCCESS(
                f"{action} {uploaded}, skipped {skipped}, missing {missing}."
            )
        )

    def _fix_url_prefixes(self, options):
        """Repoint rows whose image is stored as an absolute /media/ URL."""
        media_url = (settings.MEDIA_URL or "").rstrip("/")
        dry_run = options["dry_run"]
        fixed = unchanged = 0

        for image in ProductImage.objects.all().iterator():
            name = image.image.name or ""
            if not name:
                unchanged += 1
                continue

            relative = name
            if name.startswith(media_url):
                relative = name[len(media_url) :]
            elif "/media/" in name:
                relative = name.split("/media/", 1)[1]
            relative = relative.lstrip("/")

            if relative == name:
                unchanged += 1
                continue

            if dry_run:
                self.stdout.write(f"would fix: {name} -> {relative}")
            else:
                image.image.name = relative
                image.save(update_fields=["image"])
                self.stdout.write(self.style.SUCCESS(f"fixed: {name} -> {relative}"))
            fixed += 1

        action = "Would fix" if dry_run else "Fixed"
        self.stdout.write(
            self.style.SUCCESS(f"{action} {fixed}, unchanged {unchanged}.")
        )

    def _restore_local_names(self, options):
        """Point rows at the actual file present under MEDIA_ROOT."""
        import re as _re

        media_root = Path(settings.MEDIA_ROOT)
        dry_run = options["dry_run"]
        fixed = unchanged = missing = 0

        for image in ProductImage.objects.all().iterator():
            name = image.image.name or ""
            if not name:
                unchanged += 1
                continue

            local = media_root / name
            if local.exists():
                unchanged += 1
                continue

            found = None
            stem, _ext = _re.match(r"^(.*?)(\.[^/]*)?$", name).groups()
            stripped = _re.sub(r"_[A-Za-z0-9]{6}$", "", stem)
            base = stripped.split("/")[-1]
            folder = str(Path(name).parent)
            folder_dir = media_root / folder
            if folder_dir.is_dir():
                for p in sorted(folder_dir.iterdir()):
                    if p.stem == base or p.stem == base[:32]:
                        found = f"{folder}/{p.name}"
                        break

            if not found:
                self.stdout.write(self.style.WARNING(f"no local file for: {name}"))
                missing += 1
                continue

            if dry_run:
                self.stdout.write(f"would restore: {name} -> {found}")
            else:
                image.image.name = found
                image.save(update_fields=["image"])
                self.stdout.write(self.style.SUCCESS(f"restored: {name} -> {found}"))
            fixed += 1

        action = "Would restore" if dry_run else "Restored"
        self.stdout.write(
            self.style.SUCCESS(f"{action} {fixed}, unchanged {unchanged}, missing {missing}.")
        )
