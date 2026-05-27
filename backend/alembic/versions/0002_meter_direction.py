"""add direction, fix enums and constraints on meters

Revision ID: 0002_meter_direction
Revises: 0b19de7786d4
Create Date: 2026-03-28

What this migration does:
  1. Fixes the metertype enum values to match SQLAlchemy model (UPPERCASE)
  2. Fixes the meterstatus enum values to match SQLAlchemy model (UPPERCASE)
  3. Creates the phasetype enum if it doesn't exist (it was added via psql, 
     so Alembic doesn't know about it — we make it explicit here)
  4. Creates the directiontype enum (new)
  5. Adds the direction column to meters
  6. Drops the broken chk_phase_type_conditional constraint
  7. Recreates chk_phase_type_conditional correctly
  8. Adds chk_direction_conditional

BEFORE RUNNING:
  Replace <replace_with_your_current_head_revision> above with the output of:
      alembic heads
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers
revision = "0002_meter_direction"
down_revision = "0b19de7786d4"
branch_labels = None
depends_on = None


# ─── Enum definitions ─────────────────────────────────────────────────────────

# These match the DB enum names exactly
metertype_enum     = postgresql.ENUM("ELECTRICITY", "WATER", "GAS", "HEAT", "SOLAR",
                                      name="metertype", create_type=False)
meterstatus_enum   = postgresql.ENUM("ACTIVE", "INACTIVE", "MAINTENANCE", "OFFLINE",
                                      name="meterstatus", create_type=False)
phasetype_enum     = postgresql.ENUM("SINGLE_PHASE", "THREE_PHASE", "TWO_PHASE",
                                      name="phasetype", create_type=False)
directiontype_enum = postgresql.ENUM("IMPORT", "EXPORT", "BIDIRECTIONAL",
                                      name="directiontype", create_type=True)  # NEW — create it


def upgrade():
    # ── 1. Fix metertype enum values ──────────────────────────────────────────
    # DB currently has UPPERCASE values from psql; Python model had lowercase.
    # The Python model is now fixed to UPPERCASE so no DB change needed here.
    # But if your DB has lowercase values, uncomment and run these:
    #
    # op.execute("ALTER TYPE metertype RENAME TO metertype_old")
    # op.execute("CREATE TYPE metertype AS ENUM ('ELECTRICITY','WATER','GAS','HEAT','SOLAR')")
    # op.execute("""
    #     ALTER TABLE meters
    #         ALTER COLUMN meter_type TYPE metertype
    #         USING meter_type::text::metertype
    # """)
    # op.execute("DROP TYPE metertype_old")
    #
    # Run this first to check: 
    #   SELECT DISTINCT meter_type FROM meters;
    # If values are lowercase, uncomment the block above.

    # ── 2. Create directiontype enum ──────────────────────────────────────────
    directiontype_enum.create(op.get_bind(), checkfirst=True)

    # ── 3. Add direction column ───────────────────────────────────────────────
    op.add_column(
        "meters",
        sa.Column(
            "direction",
            postgresql.ENUM("IMPORT", "EXPORT", "BIDIRECTIONAL",
                            name="directiontype", create_type=False),
            nullable=True,
            comment="Conditionally required for ELECTRICITY and SOLAR meters"
        )
    )
    # ── NEW: Backfill direction for existing ELECTRICITY/SOLAR meters ─────────
    op.execute("""
        UPDATE meters
        SET direction = 'IMPORT'
        WHERE meter_type IN ('ELECTRICITY', 'SOLAR')
          AND direction IS NULL
    """)
   
    # ── 4. Drop the broken phase_type constraint ──────────────────────────────
    op.drop_constraint("chk_phase_type_conditional", "meters", type_="check")

    # ── 5. Recreate phase_type constraint correctly ───────────────────────────
    op.create_check_constraint(
        "chk_phase_type_conditional",
        "meters",
        """
        (meter_type IN ('ELECTRICITY', 'SOLAR') AND phase_type IS NOT NULL)
        OR
        (meter_type NOT IN ('ELECTRICITY', 'SOLAR') AND phase_type IS NULL)
        """
    )

    # ── 6. Add direction constraint ───────────────────────────────────────────
    op.create_check_constraint(
        "chk_direction_conditional",
        "meters",
        """
        (meter_type IN ('ELECTRICITY', 'SOLAR') AND direction IS NOT NULL)
        OR
        (meter_type NOT IN ('ELECTRICITY', 'SOLAR') AND direction IS NULL)
        """
    )


def downgrade():
    # Remove direction constraint
    op.drop_constraint("chk_direction_conditional", "meters", type_="check")

    # Remove direction column
    op.drop_column("meters", "direction")

    # Drop directiontype enum
    directiontype_enum.drop(op.get_bind(), checkfirst=True)

    # Restore the original (broken) phase_type constraint
    # Note: restoring the broken version so downgrade is a true rollback.
    # If you want to keep the fixed constraint on downgrade, adjust this.
    op.drop_constraint("chk_phase_type_conditional", "meters", type_="check")
    op.create_check_constraint(
        "chk_phase_type_conditional",
        "meters",
        """
        (meter_type = ANY (ARRAY['ELECTRICITY'::metertype, 'SOLAR'::metertype])
            AND phase_type IS NOT NULL)
        OR
        (meter_type = ANY (ARRAY['ELECTRICITY'::metertype, 'SOLAR'::metertype])
            AND phase_type IS NULL)
        """
    )
