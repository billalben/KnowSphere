import arcjet, {
  detectBot,
  fixedWindow,
  protectSignup,
  sensitiveInfo,
  shield,
  slidingWindow,
} from "@arcjet/next";
import { env } from "./env";

// Re-export the rules to simplify imports inside handlers
export {
  detectBot,
  fixedWindow,
  protectSignup,
  sensitiveInfo,
  shield,
  slidingWindow,
};

// Create a base Arcjet instance for use by each handler
export default arcjet({
  key: env.ARCJET_KEY,
  characteristics: ["fingerprint"],
  // base rules applied to all handlers
  rules: [
    shield({ mode: "LIVE" }), // protect against common attacks
    // detectBot({ mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE"] }), // detect and block bots
  ],
});
