"""add user role

Revision ID: e12e23bee8c6
Revises: 5a4eb2eb98c6
Create Date: 2026-08-12 12:38:49.408141

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e12e23bee8c6"
down_revision: Union[str, Sequence[str], None] = "5a4eb2eb98c6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


user_role_enum = sa.Enum(
    "candidate",
    "admin",
    name="user_role",
)


def upgrade() -> None:
    """Upgrade schema."""

    user_role_enum.create(op.get_bind(), checkfirst=True)

    op.add_column(
        "users",
        sa.Column(
            "role",
            user_role_enum,
            nullable=False,
            server_default="candidate",
        ),
    )

    op.alter_column(
        "users",
        "role",
        server_default=None,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column("users", "role")

    user_role_enum.drop(
        op.get_bind(),
        checkfirst=True,
    )