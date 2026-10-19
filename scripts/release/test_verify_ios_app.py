import plistlib
import subprocess
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("verify-ios-app.py")


class IOSAppVerificationTests(unittest.TestCase):
    def setUp(self):
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.app = Path(self.temporary_directory.name) / "App.app"
        self.app.mkdir()
        (self.app / "AppExecutable").write_bytes(b"simulator executable fixture")
        (self.app / "public/data").mkdir(parents=True)
        (self.app / "public/data/hymns.json").write_text('{"version":1,"hymns":[]}', encoding="utf-8")
        with (self.app / "Info.plist").open("wb") as info:
            plistlib.dump(
                {
                    "CFBundleIdentifier": "org.ucbmackenna.himnario",
                    "CFBundleShortVersionString": "0.1.0",
                    "CFBundleVersion": "43",
                    "CFBundleExecutable": "AppExecutable",
                },
                info,
            )

    def tearDown(self):
        self.temporary_directory.cleanup()

    def run_verifier(self):
        return subprocess.run(
            ["python3", str(SCRIPT), str(self.app), "0.1.0", "43"],
            text=True,
            capture_output=True,
        )

    def test_accepts_valid_simulator_bundle(self):
        result = self.run_verifier()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Verified simulator app", result.stdout)

    def test_rejects_version_mismatch(self):
        with (self.app / "Info.plist").open("wb") as info:
            plistlib.dump(
                {
                    "CFBundleIdentifier": "org.ucbmackenna.himnario",
                    "CFBundleShortVersionString": "9.9.9",
                    "CFBundleVersion": "43",
                    "CFBundleExecutable": "AppExecutable",
                },
                info,
            )
        result = self.run_verifier()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("CFBundleShortVersionString expected", result.stderr)

    def test_rejects_missing_catalog(self):
        (self.app / "public/data/hymns.json").unlink()
        result = self.run_verifier()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("embedded hymn catalog is missing", result.stderr)


if __name__ == "__main__":
    unittest.main()
