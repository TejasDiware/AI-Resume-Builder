export function safeNavigate(navigate, path, options = {}) {
  navigate(path, options)
  window.setTimeout(() => {
    const expected = new URL(path, window.location.origin).pathname
    if (window.location.pathname !== expected) {
      window.location.href = path
    }
  }, 120)
}
