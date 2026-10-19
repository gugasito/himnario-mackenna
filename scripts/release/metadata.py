#!/usr/bin/env python3
"""Validate a release tag and emit safe, numeric native version metadata."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

TAG_PATTERN = re.compile(
    r"^v?(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)"
    r"(?:-((?:0|[1-9][0-9]*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)"
    r"(?:\.(?:0|[1-9][0-9]*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*))*))?$"
)


def parse_tag(tag: str, run_number: str) -> dict[str, str]:
    match = TAG_PATTERN.fullmatch(tag)
    if not match:
        raise ValueError("version must be v?major.minor.patch[-prerelease] (strict SemVer)")
    if not run_number.isascii() or not run_number.isdecimal() or int(run_number) < 1:
        raise ValueError("run number must be a positive integer")
    version_code = int(run_number)
    if version_code > 2_100_000_000:
        raise ValueError("run number exceeds Android's supported versionCode limit")
    major, minor, patch, _prerelease = match.groups()
    return {
        "tag": tag,
        "version_name": f"{major}.{minor}.{patch}",
        "version_code": str(version_code),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("tag")
    parser.add_argument("run_number")
    parser.add_argument("source_sha")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    try:
        values = parse_tag(args.tag, args.run_number)
    except ValueError as error:
        parser.error(str(error))
    # Values are regex-validated and contain no newlines or output syntax.
    if not re.fullmatch(r"[0-9a-f]{40,64}", args.source_sha):
        parser.error("source commit must be a full hexadecimal Git object ID")
    values["source_sha"] = args.source_sha
    with args.output.open("a", encoding="utf-8") as output:
        for key, value in values.items():
            output.write(f"{key}={value}\n")
    print(f"Validated {values['tag']} as {values['version_name']} (build {values['version_code']})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
