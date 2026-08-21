import os
from urllib.parse import quote

from playwright.sync_api import Error as PlaywrightError
from playwright.sync_api import sync_playwright

from app.core.security import create_resume_render_token


DEFAULT_FRONTEND_BASE_URL = "http://localhost:5173"

# Chromium installed by Debian inside the Docker image.
CHROMIUM_EXECUTABLE_PATH = "/usr/bin/chromium"


def get_frontend_base_url() -> str:
    value = os.getenv(
        "FRONTEND_BASE_URL",
        DEFAULT_FRONTEND_BASE_URL,
    )
    return value.rstrip("/")


def render_resume_pdf_via_frontend(
    *,
    resume_id: int,
    user_id: int,
) -> bytes:
    """
    Render the actual React resume template in Chromium
    and export it as an A4 PDF.
    """

    frontend_base_url = get_frontend_base_url()

    render_token = create_resume_render_token(
        user_id=user_id,
        resume_id=resume_id,
        expires_minutes=5,
    )

    render_url = (
        f"{frontend_base_url}/internal/resume-pdf/{resume_id}"
        f"?token={quote(render_token)}"
    )

    with sync_playwright() as playwright:
        try:
            browser = playwright.chromium.launch(
                executable_path="/usr/bin/chromium",
                headless=True,
                args=[
                    "--disable-dev-shm-usage",
                    "--no-sandbox",
                    "--disable-gpu",
                ],
            )
        except PlaywrightError as exc:
            raise RuntimeError(
                "System Chromium is not available at "
                f"{CHROMIUM_EXECUTABLE_PATH}."
            ) from exc

        context = browser.new_context(
            viewport={
                "width": 1440,
                "height": 2000,
            },
            device_scale_factor=1,
            ignore_https_errors=True,
        )

        page = context.new_page()

        try:
            page.goto(
                render_url,
                wait_until="domcontentloaded",
                timeout=120000,
            )

            page.wait_for_function(
                "() => window.__resumePdfReady__ === true",
                timeout=120000,
            )

            pdf_bytes = page.pdf(
                format="A4",
                print_background=True,
                prefer_css_page_size=False,
                margin={
                    "top": "0",
                    "right": "0",
                    "bottom": "0",
                    "left": "0",
                },
            )

            return pdf_bytes

        finally:
            context.close()
            browser.close()