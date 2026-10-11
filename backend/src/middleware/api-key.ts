import { createHash, timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { env } from "../config/env";
import { HttpError } from "../utils/http-error";

export const API_KEY_HEADER = "x-api-key";

// Hashing first gives equal-length buffers, so the comparison is constant-time
// and does not leak the length of a valid key.
const digest = (value: string) => createHash("sha256").update(value).digest();
const validDigests = env.API_KEYS.map(digest);

function isValidKey(candidate: string): boolean {
  const candidateDigest = digest(candidate);
  let match = false;
  for (const valid of validDigests) {
    // No early exit: every key is compared regardless of earlier matches.
    if (timingSafeEqual(candidateDigest, valid)) match = true;
  }
  return match;
}

export const requireApiKey: RequestHandler = (req, _res, next) => {
  const key = req.header(API_KEY_HEADER);
  if (!key) {
    return next(HttpError.unauthorized(`Missing API key. Send it in the "${API_KEY_HEADER}" header.`));
  }
  if (!isValidKey(key)) {
    return next(HttpError.unauthorized("Invalid API key."));
  }
  next();
};
