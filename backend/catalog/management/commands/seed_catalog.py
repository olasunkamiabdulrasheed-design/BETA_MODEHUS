import os
import random
from decimal import Decimal
from pathlib import Path

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from PIL import Image, ImageDraw, ImageFont

from accounts.models import User
from catalog.models import Brand, Category, Product, ProductImage, ProductVariant

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

CATEGORIES = [
    "Agbada", "Senator Wear", "Kaftan", "Native Shirts", "Native Trousers",
    "Traditional Two-Piece", "Ankara Wear", "Lace Outfits", "Men's Shirts",
    "Trousers", "Dresses", "Jumpsuits", "Hoodies", "Jackets", "Shorts",
]

PRODUCTS = [
    {
        "category": "Agbada",
        "name": "Classic Embroidered Agbada Set",
        "price": "95000",
        "desc": "A three-piece flowing agbada with subtle embroidered details, tailored for ceremonies and special occasions.",
        "sizes": ["M", "L", "XL", "XXL"],
        "colors": [("Navy", "#1a2a44"), ("Wine", "#722f37"), ("Emerald", "#046307")],
    },
    {
        "category": "Senator Wear",
        "name": "Premium Senator Wear with Crest",
        "price": "55000",
        "desc": "Two-piece senator wear with a fitted crest detail. A refined choice for a polished contemporary look.",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "colors": [("Black", "#111111"), ("Beige", "#c3a46b"), ("Ash", "#9aa3ad")],
    },
    {
        "category": "Kaftan",
        "name": "Flow Long-Sleeve Kaftan",
        "price": "45000",
        "desc": "Comfortable long-sleeve kaftan cut for an elegant, relaxed fit.",
        "sizes": ["M", "L", "XL"],
        "colors": [("White", "#f4f4f4"), ("Royal Blue", "#21409a")],
    },
    {
        "category": "Native Shirts",
        "name": "Short-Sleeve Native Shirt",
        "price": "32000",
        "desc": "A crisp short-sleeve native shirt suited to smart-casual and everyday wear.",
        "sizes": ["S", "M", "L", "XL", "XXL", "XXXL"],
        "colors": [("White", "#f4f4f4"), ("Slate", "#55606b"), ("Champagne", "#d9c9a3")],
    },
    {
        "category": "Native Trousers",
        "name": "Tailored Native Trousers",
        "price": "25000",
        "desc": "Well-cut native trousers that pair with any of our shirts for a complete look.",
        "sizes": ["30", "32", "34", "36", "38", "40"],
        "colors": [("Black", "#111111"), ("Grey", "#6b6f74")],
    },
    {
        "category": "Traditional Two-Piece",
        "name": "Two-Piece Corporate Native Set",
        "price": "68000",
        "desc": "A complete two-piece traditional set styled for the modern professional.",
        "sizes": ["M", "L", "XL"],
        "colors": [("Burgundy", "#6e1f2b"), ("Brown", "#5b3a29")],
    },
    {
        "category": "Ankara Wear",
        "name": "Vibrant Ankara Two-Piece",
        "price": "48000",
        "desc": "Bold ankara prints cut into a modern two-piece. Each piece is unique to its fabric run.",
        "sizes": ["S", "M", "L", "XL"],
        "colors": [("Multicolour", "#d17a22")],
    },
    {
        "category": "Lace Outfits",
        "name": "Elegant Lace Outfit for Occasion",
        "price": "72000",
        "desc": "Luxurious lace outfit tailored for weddings and formal celebrations.",
        "sizes": ["M", "L", "XL"],
        "colors": [("Ivory", "#f5efdf"), ("Gold", "#b7952f")],
    },
    {
        "category": "Men's Shirts",
        "name": "Crisp Classic Button-Down Shirt",
        "price": "28000",
        "desc": "A well-fitted button-down shirt in breathable cotton for daily wear.",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "colors": [("White", "#f4f4f4"), ("Sky", "#a9c6e6")],
    },
    {
        "category": "Dresses",
        "name": "Elegant Ankara Maxi Dress",
        "price": "42000",
        "desc": "Flowing maxi dress cut from premium ankara fabric, made to move.",
        "sizes": ["S", "M", "L", "XL"],
        "colors": [("Multicolour", "#8a2b8f")],
    },
    {
        "category": "Jumpsuits",
        "name": "Tailored Jumpsuit",
        "price": "46000",
        "desc": "A sleek tailored jumpsuit offering polish and ease in one piece.",
        "sizes": ["S", "M", "L"],
        "colors": [("Black", "#111111"), ("Forest", "#1f3d2b")],
    },
    {
        "category": "Hoodies",
        "name": "Premium Oversized Hoodie",
        "price": "35000",
        "desc": "Soft heavyweight hoodie with a relaxed oversized fit for everyday comfort.",
        "sizes": ["M", "L", "XL", "XXL"],
        "colors": [("Charcoal", "#353b40"), ("Navy", "#1a2a44")],
    },
    {
        "category": "Jackets",
        "name": "Structured Casual Jacket",
        "price": "58000",
        "desc": "A sharp casual jacket that layers effortlessly over shirts and hoodies.",
        "sizes": ["M", "L", "XL"],
        "colors": [("Black", "#111111"), ("Taupe", "#8f7761")],
    },
    {
        "category": "Shorts",
        "name": "Comfort Casual Shorts",
        "price": "18000",
        "desc": "Relaxed-fit shorts for warm days, in easy-wearing cotton.",
        "sizes": ["S", "M", "L", "XL"],
        "colors": [("Olive", "#556b2f"), ("Grey", "#6b6f74")],
    },
]


class Command(BaseCommand):
    help = "Seed 15 categories and demo Nigerian fashion products with replaceable placeholder images."

    def handle(self, *args, **options):
        if not User.objects.filter(is_superuser=True).exists():
            admin_email = os.environ.get("SEED_ADMIN_EMAIL", "betamodehus@gmail.com")
            admin_password = os.environ.get("SEED_ADMIN_PASSWORD", "")
            if not User.objects.filter(email=admin_email).exists():
                if not admin_password:
                    admin_password = User.objects.make_random_password(
                        length=20
                    )
                User.objects.create_superuser(admin_email, admin_password)
                self.stdout.write(
                    self.style.WARNING(
                        f"Admin created: {admin_email} — set SEED_ADMIN_EMAIL/"
                        "SEED_ADMIN_PASSWORD on next fresh seed. If no password "
                        "was set, it was randomized (dev only)."
                    )
                )
            else:
                self.stdout.write("Admin already exists.")

        created_cat = 0
        for name in CATEGORIES:
            _, was_created = Category.objects.get_or_create(name=name)
            created_cat += int(was_created)
        self.stdout.write(self.style.SUCCESS(f"Categories ready ({created_cat} created)."))

        brand, _ = Brand.objects.get_or_create(name="BETA_MODEHUS")
        media_dir = BASE_DIR / "media"
        media_dir.mkdir(parents=True, exist_ok=True)
        placeholder_cache = {}

        for spec in PRODUCTS:
            name = spec["name"]
            category = Category.objects.get(name=spec["category"])
            product, created = Product.objects.get_or_create(
                name=name,
                defaults={
                    "category": category,
                    "brand": brand,
                    "price": Decimal(spec["price"]),
                    "sku": f"BM-{spec['category'].split()[0].upper()}-{abs(hash(name)) % 9000 + 1000}",
                    "short_description": spec["desc"][:280],
                    "description": spec["desc"],
                    "is_featured": True,
                },
            )
            if not created:
                product.category = category
                product.save()

            for size in spec["sizes"]:
                for color, hexcode in spec["colors"]:
                    variant_sku = f"{product.sku}-{size}-{color.upper()}"
                    ProductVariant.objects.get_or_create(
                        product=product,
                        size=size,
                        color=color,
                        defaults={
                            "sku": variant_sku,
                            "color_hex": hexcode,
                            "stock": random.randint(8, 40),
                        },
                    )

            if not product.images.exists():
                path = self._placeholder(media_dir, placeholder_cache, name, spec["colors"])
                with open(path, "rb") as fh:
                    ProductImage.objects.create(
                        product=product,
                        image=ContentFile(fh.read(), name=path.name),
                        alt_text=f"Demo image for {name} — replace with the real product photo from the admin dashboard.",
                        is_primary=True,
                    )
            self.stdout.write(f"  product: {name}")

        self.stdout.write(self.style.SUCCESS("Seed complete."))

    def _placeholder(self, media_dir, cache, name, colors):
        safe = "".join(c for c in name if c.isalnum() or c in " -_")[:40].strip().replace(" ", "-")
        path = media_dir / "products" / f"{safe}.png"
        if path in cache:
            return cache[path]
        path.parent.mkdir(parents=True, exist_ok=True)
        hexcode = colors[0][1].lstrip("#")
        main = tuple(int(hexcode[i : i + 2], 16) for i in (0, 2, 4))
        img = Image.new("RGB", (900, 1200), main)
        draw = ImageDraw.Draw(img)
        draw.rectangle([30, 30, 870, 1170], outline=(255, 255, 255), width=4)
        label = "BETA_MODEHUS"
        sub = "For Better Elegance and Luxury"
        try:
            font_main = ImageFont.truetype("arialbd.ttf", 56)
            font_sub = ImageFont.truetype("arial.ttf", 34)
        except OSError:
            font_main = ImageFont.load_default()
            font_sub = font_main
        try:
            draw.text((450, 600), label, fill=(255, 255, 255), anchor="mm", font=font_main)
            draw.text((450, 680), sub, fill=(255, 255, 255), anchor="mm", font=font_sub)
        except TypeError:
            draw.text((450, 600), label, fill=(255, 255, 255), font=font_main)
            draw.text((450, 700), sub, fill=(255, 255, 255), font=font_sub)
        img.save(path, "PNG")
        cache[path] = path
        return path