#!/bin/sh
set -e

# Generate runtime env config for client-side code
cat > /app/public/env-config.js <<EOF
window.__ENV__ = {
  NEXT_PUBLIC_API_URL: "${NEXT_PUBLIC_API_URL:-}"
};
EOF

exec "$@"
