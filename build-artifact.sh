#!/usr/bin/env bash
# Strips the standalone page wrapper so www/index.html can be published as an
# Artifact, which supplies its own doctype/head/body skeleton.
set -euo pipefail
python3 - <<'PY'
import re
s=open('www/index.html').read()
s=re.sub(r'^<!DOCTYPE html>\s*<html lang="en">\s*<head>\s*','',s)
# drop every head-only tag (charset, viewport, manifest, apple-* icons)
s=re.sub(r'^\s*<(?:meta|link)\b[^>]*>\s*\n','',s,flags=re.M)
s=s.replace('</head>\n<body>\n','').replace('\n</body>\n</html>\n','\n')
for bad in ['<!DOCTYPE','<head>','<body>','</html>']:
    assert bad not in s, bad
assert s.lstrip().startswith('<title>'), s[:80]
open('.artifact-build.html','w').write(s)
print('built .artifact-build.html', len(s), 'chars')
PY
