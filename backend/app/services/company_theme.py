import re
from typing import Optional
from reportlab.lib import colors
from sqlalchemy.orm import Session

from app.core.cache import reference_data_cache
from app.db.session import SessionLocal
from app.models.company import CompanyMasterDetails

DEFAULT_THEME_HEX = "#00cba0"
_HEX_RE = re.compile(r"^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$")


def normalize_hex_color(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    trimmed = str(value).strip()
    if not _HEX_RE.match(trimmed):
        return None
    if len(trimmed) == 4:
        trimmed = "#" + "".join(ch * 2 for ch in trimmed[1:])
    return trimmed.lower()


def get_company_theme_hex(db: Optional[Session] = None, company_name: str = "Nexus") -> Optional[str]:
    cache_key = f"master:company:theme:{company_name.lower()}"

    def _loader() -> str:
        own_session = db is None
        session = SessionLocal() if own_session else db
        try:
            company = (
                session.query(CompanyMasterDetails)
                .filter(CompanyMasterDetails.company_name.ilike(company_name))
                .first()
            )
            if not company:
                company = session.query(CompanyMasterDetails).order_by(CompanyMasterDetails.company_id.asc()).first()
            return normalize_hex_color(company.hex_color_code) or ""
        except Exception:
            return ""
        finally:
            if own_session:
                session.close()

    cached = reference_data_cache.get_or_set(cache_key, _loader, ttl=60.0)
    return cached or None


def get_pdf_header_color(default_color: colors.Color, db: Optional[Session] = None, company_name: str = "Nexus") -> colors.Color:
    theme_hex = get_company_theme_hex(db=db, company_name=company_name)
    if theme_hex:
        try:
            return colors.HexColor(theme_hex)
        except Exception:
            return default_color
    return default_color
