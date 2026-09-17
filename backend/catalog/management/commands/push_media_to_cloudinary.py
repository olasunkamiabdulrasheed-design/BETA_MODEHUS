from pathlib import Path

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

    def handle(self, *args, **options):
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
