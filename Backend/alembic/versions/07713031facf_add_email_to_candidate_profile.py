"""add email to candidate profile

Revision ID: 07713031facf
Revises: 51a590a9747c
Create Date: 2026-08-14
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "07713031facf"
down_revision = "51a590a9747c"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "candidate_profiles",
        sa.Column(
            "email",
            sa.String(length=255),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column(
        "candidate_profiles",
        "email",
    )