import java.io.InputStream;
import java.nio.file.Path;
import java.security.CodeSigner;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

/** Verify every bundle payload's JAR signature and digest without requiring a trusted CA. */
public final class VerifySignedBundle {
    private VerifySignedBundle() {}

    public static void main(String[] args) throws Exception {
        if (args.length != 1) {
            System.err.println("Usage: java VerifySignedBundle.java <bundle.aab>");
            System.exit(2);
        }

        int signedPayloads = 0;
        try (JarFile jar = new JarFile(Path.of(args[0]).toFile(), true)) {
            var entries = jar.entries();
            while (entries.hasMoreElements()) {
                JarEntry entry = entries.nextElement();
                try (InputStream contents = jar.getInputStream(entry)) {
                    contents.transferTo(java.io.OutputStream.nullOutputStream());
                }
                if (entry.isDirectory() || isSignatureControl(entry.getName())) {
                    continue;
                }
                CodeSigner[] signers = entry.getCodeSigners();
                if (signers == null || signers.length == 0) {
                    throw new SecurityException("Unsigned bundle payload: " + entry.getName());
                }
                signedPayloads++;
            }
        }

        if (signedPayloads == 0) {
            throw new SecurityException("Bundle contains no signed payload entries");
        }
        System.out.println("Verified signed bundle payload entries: " + signedPayloads);
    }

    private static boolean isSignatureControl(String name) {
        String upper = name.toUpperCase(java.util.Locale.ROOT);
        if (upper.equals("META-INF/MANIFEST.MF")) {
            return true;
        }
        if (!upper.startsWith("META-INF/")) {
            return false;
        }
        String filename = upper.substring("META-INF/".length());
        if (filename.isEmpty() || filename.contains("/")) {
            return false;
        }
        return filename.endsWith(".SF") || filename.endsWith(".RSA")
                || filename.endsWith(".DSA") || filename.endsWith(".EC");
    }
}
