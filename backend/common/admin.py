from django.contrib import admin

from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "created_at", "is_handled")
    list_filter = ("is_handled", "created_at")
    search_fields = ("name", "email", "subject", "message")
    list_editable = ("is_handled",)
    readonly_fields = ("name", "email", "phone", "subject", "message", "created_at")
    date_hierarchy = "created_at"