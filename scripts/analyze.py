#!/usr/bin/env python3
"""Analyze TrackFlow incident CSV records without exposing customer emails."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import TextIO

from adrianmorgd_trackflow.incidents.analyzer import (
    analyze,
    export_summary,
    print_summary,
    read_records,
)


def main(argv: list[str] | None = None, input_stream: TextIO = sys.stdin) -> int:
    parser = argparse.ArgumentParser(description="Analyze a TrackFlow incidents CSV file.")
    parser.add_argument("csv_file", type=Path, help="Path to the incidents CSV file")
    args = parser.parse_args(argv)

    try:
        records, extra_rows = read_records(args.csv_file)
        summary = analyze(records, extra_rows)
    except ValueError as error:
        print(f"Error: {error}", file=sys.stderr)
        return 2

    print_summary(args.csv_file.name, summary)
    try:
        print("\nExport results to CSV? [y/n]")
        print("Your choice: ", end="", flush=True)
        choice = input_stream.readline().strip().lower()
        if not choice:
            print("No choice received; results were not exported.")
            return 0
        if choice not in {"y", "n"}:
            print("Invalid choice. Please enter 'y' or 'n'.")
            return 2
        if choice == "y":
            export_summary(Path("results.csv"), summary)
            print("Aggregate results exported to results.csv (no email addresses included).")
        else:
            print("Results were not exported.")
    except ValueError as error:
        print(f"Error: {error}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
