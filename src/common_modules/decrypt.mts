import crypto from "crypto";

const encryptionKey = process.env.ENCRYPTION_KEY;

export const decrypt = (text: string | undefined) => {
    if (text) {
        const textParts = text.split(":");
        const iv = Buffer.from(textParts.shift() as string, "hex");
        const encryptedText = Buffer.from(textParts.join(":"), "hex");

        if (encryptionKey) {
            const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(encryptionKey), iv);
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        }
        return null;
    }
}