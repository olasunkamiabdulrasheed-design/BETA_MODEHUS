import hashlib
import hmac
import json
import logging
from decimal import Decimal

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

# OPay loads amounts in the smallest currency unit (kobo for NGN).
PAYMENT_STATUS = {
    "INITIAL": "pending",
    "PENDING": "pending",
    "SUCCESS": "success",
    "FAIL": "failed",
    "CLOSE": "cancelled",
}


class OpayError(Exception):
    pass


def _request_headers(token, merchant_id):
    return {
        "Authorization": f"Bearer {token}",
        "MerchantId": merchant_id,
        "Content-Type": "application/json",
    }


def _signature(private_key, payload: dict) -> str:
    """HMAC-SHA512 hex signature over the JSON payload with alphabetically
    sorted keys (OPay's requirement)."""
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hmac.new(private_key.encode(), canonical.encode(), hashlib.sha512).hexdigest()


def _kobo(amount) -> int:
    return int((Decimal(amount) * 100).to_integral_value())


class OpayClient:
    """Thin HTTP client for the OPay Cashier API (/api/v1/international)."""

    def __init__(self):
        self.base_url = settings.OPAY_BASE_URL.rstrip("/")
        self.merchant_id = settings.OPAY_MERCHANT_ID
        self.public_key = settings.OPAY_PUBLIC_KEY
        self.private_key = getattr(settings, "OPAY_PRIVATE_KEY", "")
        if not (self.merchant_id and self.public_key and self.private_key):
            raise OpayError(
                "OPay is not configured. Set OPAY_MERCHANT_ID, OPAY_PUBLIC_KEY "
                "and OPAY_PRIVATE_KEY in .env."
            )

    def _post(self, path, payload, token):
        url = f"{self.base_url}{path}"
        try:
            resp = requests.post(
                url,
                json=payload,
                headers=_request_headers(token, self.merchant_id),
                timeout=15,
            )
        except requests.RequestException as exc:
            logger.error("OPay request failed: %s", exc)
            raise OpayError("Could not reach OPay. Please try again.") from exc

        try:
            body = resp.json()
        except ValueError:
            logger.error("OPay non-JSON response (%s): %.200s", resp.status_code, resp.text)
            raise OpayError("Unexpected response from OPay.")

        if not (200 <= resp.status_code < 300) or str(body.get("code")) != "00000":
            logger.error("OPay error (%s): %s", resp.status_code, body)
            raise OpayError(body.get("message") or f"OPay error {resp.status_code}.")
        return body.get("data") or {}

    def create_cashier(
        self,
        reference,
        amount,
        product_name,
        return_url=None,
        callback_url=None,
        cancel_url=None,
        country="NG",
        currency="NGN",
        user_email="",
        user_mobile="",
    ):
        """Create a hosted OPay Cashier order. Returns data containing
        ``cashierUrl`` (redirect the customer there)."""
        payload = {
            "reference": reference,
            "country": country,
            "amount": {"currency": currency, "total": _kobo(amount)},
            "product": {"name": product_name, "description": "BETA_MODEHUS order"},
            "expireAt": 30,
        }
        if return_url:
            payload["returnUrl"] = return_url
        if callback_url:
            payload["callbackUrl"] = callback_url
        if cancel_url:
            payload["cancelUrl"] = cancel_url
        if user_email or user_mobile:
            payload["userInfo"] = {"userEmail": user_email, "userMobile": user_mobile}

        # Cashier creation authenticates with the PUBLIC key as bearer token.
        return self._post("/api/v1/international/cashier/create", payload, self.public_key)

    def query_status(self, reference=None, order_no=None, country="NG"):
        """Query payment status by merchant reference or OPay orderNo.

        Authenticated with an HMAC-SHA512 signature of the request payload
        signed with the PRIVATE key."""
        payload = {"country": country}
        if reference:
            payload["reference"] = reference
        if order_no:
            payload["orderNo"] = order_no
        signature = _signature(self.private_key, payload)
        return self._post("/api/v1/international/cashier/status", payload, signature)


def verify_callback_signature(private_key, raw_body: bytes, provided: str) -> bool:
    expected = hmac.new(
        private_key.encode(), raw_body, hashlib.sha512
    ).hexdigest()
    return hmac.compare_digest(expected.lower(), provided.strip().lower())