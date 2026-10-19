import unittest
import subprocess
import tempfile
from pathlib import Path

from metadata import parse_tag


class ReleaseMetadataTests(unittest.TestCase):
    SOURCE_SHA = "a" * 40

    def test_core_and_prerelease_keep_numeric_marketing_version(self):
        for tag in ("v0.1.0", "0.1.0", "v0.1.0-rc.1"):
            with self.subTest(tag=tag):
                values = parse_tag(tag, "42")
                self.assertEqual(values["tag"], tag)
                self.assertEqual(values["version_name"], "0.1.0")
                self.assertEqual(values["version_code"], "42")

    def test_rejects_invalid_versions(self):
        for tag in ("", "latest", "v01.2.3", "1.2", "1.2.3+meta", "1.2.3-01"):
            with self.subTest(tag=tag), self.assertRaises(ValueError):
                parse_tag(tag, "1")

    def test_rejects_untrusted_run_numbers(self):
        for run_number in ("0", "-1", "1\nother=x", "2.5", "2100000001"):
            with self.subTest(run_number=run_number), self.assertRaises(ValueError):
                parse_tag("v1.2.3", run_number)

    def test_cli_writes_validated_metadata_and_full_source_commit(self):
        script = Path(__file__).with_name("metadata.py")
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "outputs"
            result = subprocess.run(
                ["python3", str(script), "v0.1.0-ci.1", "43", self.SOURCE_SHA, "--output", str(output)],
                text=True,
                capture_output=True,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(
                output.read_text(encoding="utf-8"),
                f"tag=v0.1.0-ci.1\nversion_name=0.1.0\nversion_code=43\nsource_sha={self.SOURCE_SHA}\n",
            )

    def test_cli_rejects_invalid_source_commit_before_output(self):
        script = Path(__file__).with_name("metadata.py")
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "outputs"
            result = subprocess.run(
                ["python3", str(script), "v0.1.0", "43", "not-a-sha", "--output", str(output)],
                text=True,
                capture_output=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertFalse(output.exists())


if __name__ == "__main__":
    unittest.main()
