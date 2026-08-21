"""add job description to resumes

Revision ID: 8a162daed6bf
Revises: 75dcb2785f14
Create Date: 2026-08-21 07:22:49.077320

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8a162daed6bf"
down_revision: Union[str, Sequence[str], None] = "75dcb2785f14"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "resumes",
        sa.Column(
            "job_description_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_resumes_job_description_id",
        "resumes",
        ["job_description_id"],
        unique=False,
    )

    op.create_foreign_key(
        "fk_resumes_job_description_id",
        "resumes",
        "job_descriptions",
        ["job_description_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_resumes_job_description_id",
        "resumes",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_resumes_job_description_id",
        table_name="resumes",
    )

    op.drop_column(
        "resumes",
        "job_description_id",
    )