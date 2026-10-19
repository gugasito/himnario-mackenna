import shutil
import subprocess
import tempfile
import unittest
import zipfile
from pathlib import Path


SCRIPT = Path(__file__).with_name("VerifySignedBundle.java")


@unittest.skipUnless(all(shutil.which(command) for command in ("java", "keytool", "jarsigner")), "JDK signing tools are required")
class SignedBundleVerificationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temporary_directory = tempfile.TemporaryDirectory()
        cls.root = Path(cls.temporary_directory.name)
        cls.keystore = cls.root / "fixture.p12"
        subprocess.run(
            [
                "keytool", "-genkeypair", "-noprompt", "-alias", "fixture",
                "-keyalg", "RSA", "-keysize", "2048", "-validity", "2",
                "-dname", "CN=Test Fixture", "-storetype", "PKCS12",
                "-keystore", str(cls.keystore), "-storepass", "fixturepass",
                "-keypass", "fixturepass",
            ],
            check=True,
            capture_output=True,
            text=True,
        )

    @classmethod
    def tearDownClass(cls):
        cls.temporary_directory.cleanup()

    def make_bundle(self, filename="bundle.aab", extra_entries=None):
        path = self.root / filename
        with zipfile.ZipFile(path, "w") as archive:
            archive.writestr("base/manifest/AndroidManifest.xml", b"manifest payload")
            for name, data in (extra_entries or {}).items():
                archive.writestr(name, data)
        return path

    def verify(self, path):
        return subprocess.run(
            ["java", str(SCRIPT), str(path)], capture_output=True, text=True
        )

    def test_rejects_unsigned_bundle(self):
        result = self.verify(self.make_bundle("unsigned.aab"))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Unsigned bundle payload", result.stderr)

    def test_rejects_fake_signature_filename(self):
        path = self.make_bundle("fake.aab", {"META-INF/FAKE.RSA": b"not a signature"})
        result = self.verify(path)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Unsigned bundle payload", result.stderr)

    def test_accepts_real_self_signed_jarsigner_bundle(self):
        path = self.make_bundle("signed.aab", {"META-INF/services/example.Service": b"example.Impl\n"})
        subprocess.run(
            [
                "jarsigner", "-keystore", str(self.keystore), "-storetype", "PKCS12",
                "-storepass", "fixturepass", "-keypass", "fixturepass", str(path), "fixture",
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        result = self.verify(path)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Verified signed bundle payload entries", result.stdout)

    def test_rejects_tampered_signed_payload(self):
        path = self.make_bundle("tampered.aab")
        subprocess.run(
            [
                "jarsigner", "-keystore", str(self.keystore), "-storetype", "PKCS12",
                "-storepass", "fixturepass", "-keypass", "fixturepass", str(path), "fixture",
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        rewritten = self.root / "tampered-rewritten.aab"
        with zipfile.ZipFile(path, "r") as signed, zipfile.ZipFile(rewritten, "w") as altered:
            for entry in signed.infolist():
                content = b"tampered payload" if entry.filename == "base/manifest/AndroidManifest.xml" else signed.read(entry)
                altered.writestr(entry, content)
        rewritten.replace(path)
        result = self.verify(path)
        self.assertNotEqual(result.returncode, 0)
        self.assertTrue("digest" in result.stderr.lower() or "signature" in result.stderr.lower(), result.stderr)


if __name__ == "__main__":
    unittest.main()
