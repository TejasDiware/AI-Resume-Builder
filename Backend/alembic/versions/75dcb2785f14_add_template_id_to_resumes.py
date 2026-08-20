"""add template id to resumes

Revision ID: 75dcb2785f14
Revises: 07713031facf
Create Date: 2026-08-20
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "75dcb2785f14"
down_revision: Union[str, None] = "07713031facf"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add template_id as nullable first so existing resumes
    # can be safely updated.
    op.add_column(
        "resumes",
        sa.Column(
            "template_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    # Existing resumes use template 1 by default.
    op.execute(
        "UPDATE resumes SET template_id = 1 WHERE template_id IS NULL"
    )

    # Make the column required after existing rows are populated.
    op.alter_column(
        "resumes",
        "template_id",
        existing_type=sa.Integer(),
        nullable=False,
    )


def downgrade() -> None:
    op.drop_column("resumes", "template_id")