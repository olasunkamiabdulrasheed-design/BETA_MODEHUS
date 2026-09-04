from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminUser(BasePermission):
    """Only the single store owner (is_staff) may use admin endpoints."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class IsOwnerOrReadOnly(BasePermission):
    """Objects expose a ``user`` attribute; only the owner may modify."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        owner = getattr(obj, "user", None)
        if owner is None:
            owner = getattr(obj, "customer", None)
        return bool(owner and owner.pk == request.user.pk)