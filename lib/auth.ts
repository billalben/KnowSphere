import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { env } from "./env";
import { resend } from "./resend";
import { admin } from "better-auth/plugins";

// Auth is GitHub OAuth + email OTP only. There is intentionally no
// email/password provider, so there is no password-reset flow to build.
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  plugins: [
    admin(),
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        try {
          const { error } = await resend.emails.send({
            from: env.EMAIL_FROM,
            to: [email],
            subject: "Your OTP Code",
            html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
          });

          if (error) {
            console.error("Failed to send OTP email:", error);
          }
        } catch (error) {
          console.error("Failed to send OTP email:", error);
        }
      },
    }),
  ],
});
