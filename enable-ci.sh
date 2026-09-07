#!/usr/bin/env bash
# Pushes the CI workflows. Separate from the initial push because creating files
# under .github/workflows/ needs the `workflow` OAuth scope, which the gh token
# did not have. Grant it first:
#
#   gh auth refresh -s workflow -h github.com
#
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -d .ci-pending ]; then echo "Nothing pending — CI is already in place."; exit 0; fi

mkdir -p .github/workflows
mv .ci-pending/*.yml .github/workflows/
rmdir .ci-pending

git add .github/workflows
git commit -q -m "$(cat <<'MSG'
ci: TestFlight, Android APK and Pages workflows

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_016QDz96dwNECUXHpiryGQun
MSG
)"
git push
echo
echo "Done. Workflows are at:"
echo "  https://github.com/luizpaybyrd/deep-sight/actions"
echo
echo "For TestFlight, add these repository secrets first"
echo "(Settings -> Secrets and variables -> Actions) — see BUILD.md section 3:"
echo "  ASC_KEY_ID  ASC_ISSUER_ID  ASC_KEY_P8_BASE64  APPLE_TEAM_ID"
