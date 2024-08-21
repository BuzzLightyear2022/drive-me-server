import crypto from "crypto";

const encryptionKey = process.env.ENCRYPTION_KEY;
const iv = crypto.randomBytes(16);

export const encrypt = (text: string) => {
    if (encryptionKey) {
        const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(encryptionKey), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString("hex") + ":" + encrypted.toString("hex");
    }
}
