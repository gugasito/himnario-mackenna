#!/usr/bin/env python3
"""Check a simulator app bundle's identity, versions, catalog, and executable."""

from __future__ import annotations

import argparse
import plistlib
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("app", type=Path)
    parser.add_argument("version")
    parser.add_argument("build_number")
    args = parser.parse_args()
    app = args.app
    if app.suffix != ".app" or not app.is_dir():
        parser.error("expected an existing .app bundle")
    info_path = app / "Info.plist"
    with info_path.open("rb") as info_file:
        info = plistlib.load(info_file)
    expected = {
        "CFBundleIdentifier": "org.ucbmackenna.himnario",
        "CFBundleShortVersionString": args.version,
        "CFBundleVersion": args.build_number,
    }
    for key, value in expected.items():
        if info.get(key) != value:
            parser.error(f"{key} expected {value!r}, got {info.get(key)!r}")
    executable = app / info.get("CFBundleExecutable", "")
    if not executable.is_file():
        parser.error("bundle executable is missing")
    if not (app / "public/data/hymns.json").is_file():
        parser.error("embedded hymn catalog is missing")
    print(f"Verified simulator app {expected['CFBundleIdentifier']} {args.version} ({args.build_number})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
