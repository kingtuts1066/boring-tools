#!/usr/bin/env python3
"""Scan text/HTML files for ASCII control characters.

Why: copy/paste can introduce invisible bytes (e.g. ) that break typography or tooling.

Usage examples:
  python scripts/scan_control_chars.py index.html tools/*.html
  python scripts/scan_control_chars.py .

Exit codes:
  0 = no issues found
  1 = at least one file contains control chars
"""

import sys
from pathlib import Path

CONTROL_BYTES = set(range(0x00, 0x20)) - {0x09, 0x0A, 0x0D}  # allow tab, LF, CR


def iter_files(arg: str):
    p = Path(arg)
    if p.is_dir():
        for ext in (".html", ".css", ".js", ".md", ".txt"):
            yield from p.rglob(f"*{ext}")
    else:
        yield p


def scan_file(path: Path):
    data = path.read_bytes()
    hits = []
    for i, b in enumerate(data):
        if b in CONTROL_BYTES:
            hits.append((i, b))
    return hits


def main(argv):
    if len(argv) < 2:
        print("Usage: scan_control_chars.py <file|dir> [more ...]", file=sys.stderr)
        return 2

    files = []
    for a in argv[1:]:
        files.extend(list(iter_files(a)))

    uniq = []
    seen = set()
    for f in files:
        f = f.resolve()
        if f in seen:
            continue
        seen.add(f)
        if f.exists() and f.is_file():
            uniq.append(f)

    bad = {}
    for f in uniq:
        hits = scan_file(f)
        if hits:
            bad[str(f)] = hits

    if not bad:
        print("OK: no ASCII control characters found")
        return 0

    print("FOUND control characters:\n")
    for f, hits in bad.items():
        print(f"- {f}")
        for pos, b in hits:
            print(f"  byte_offset={pos} byte=0x{b:02x} ({b})")
        print()

    return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
