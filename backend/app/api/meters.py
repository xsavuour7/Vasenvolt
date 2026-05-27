from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.auth.middleware import get_current_user
from app.database import get_db
from app.models import Meter, Site, User
from app.schemas.meters import MeterOut


router = APIRouter(prefix="/api/meters", tags=["meters"])


@router.get(
    "/",
    response_model=List[MeterOut],
    summary="List meters for the current tenant",
    description="Return meters that belong to the authenticated user's tenant, including site information for filter dropdowns.",
)
async def get_meters(
    site_id: Optional[int] = Query(None, description="Optional site filter", example=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List tenant-scoped meters for the dashboard site/meter filters."""

    if current_user.tenant_id is None:
        return []

    query = (
        db.query(Meter)
        .join(Site, Meter.site_id == Site.id)
        .options(joinedload(Meter.site))
        .filter(Site.tenant_id == current_user.tenant_id)
    )

    if site_id is not None:
        query = query.filter(Meter.site_id == site_id)

    return query.order_by(Site.name.asc(), Meter.name.asc()).all()
