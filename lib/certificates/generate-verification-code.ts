import { randomBytes } from "node:crypto";

const CODE_BYTES = 9;

export function generateVerificationCode(): string {
  return randomBytes(CODE_BYTES).toString("base64url");
}
