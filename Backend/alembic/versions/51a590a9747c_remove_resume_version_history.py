from typing import Sequence, Union

from alembic import op


revision: str = "51a590a9747c"
down_revision: Union[str, Sequence[str], None] = 'e04a132617d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index(
        "ix_resume_versions_resume_id",
        table_name="resume_versions",
    )
    op.drop_table("resume_versions")


def downgrade() -> None:
    raise NotImplementedError(
        "Resume version history was intentionally removed."
    )