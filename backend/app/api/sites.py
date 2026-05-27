from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.middleware import get_current_user
from app.database import get_db
from app.models import Site, User
from app.schemas.meters import SiteOut


router = APIRouter(prefix="/api/sites", tags=["sites"])


@router.get(
    "/",
    response_model=List[SiteOut],
    summary="List sites for the current tenant",
    description="Return sites that belong to the authenticated user's tenant.",
)
async def get_sites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List tenant-scoped sites for future filter consumers."""

    if current_user.tenant_id is None:
        return []

    return (
        db.query(Site)
        .filter(Site.tenant_id == current_user.tenant_id)
        .order_by(Site.name.asc())
        .all()
    )
