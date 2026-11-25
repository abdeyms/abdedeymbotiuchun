import hmac
import os

from fastapi import Header, HTTPException


def require_admin(authorization: str | None = Header(default=None)) -> None:
    admin_token = os.getenv("ADMIN_TOKEN", "")
    if not admin_token:
        raise HTTPException(status_code=503, detail="ADMIN_TOKEN is not configured")

    scheme, separator, token = (authorization or "").partition(" ")
    if (
        not separator
        or scheme.lower() != "bearer"
        or not hmac.compare_digest(token, admin_token)
    ):
        raise HTTPException(status_code=401, detail="Admin token required")
