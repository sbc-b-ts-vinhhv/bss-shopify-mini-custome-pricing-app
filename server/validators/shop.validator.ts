import { AppError } from "../utils/AppError.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isEmailLike(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function validateCreateShopInput(body: unknown) {
  if (!isRecord(body)) {
    throw AppError.badRequest("Request body is required");
  }

  if (!isNonEmptyString(body.shop)) {
    throw AppError.badRequest("shop is required");
  }

  if (!isNonEmptyString(body.token)) {
    throw AppError.badRequest("token is required");
  }

  if (!isNonEmptyString(body.name)) {
    throw AppError.badRequest("name is required");
  }

  if (body.email !== undefined && !isEmailLike(body.email)) {
    throw AppError.badRequest("Invalid email");
  }

  if (body.senderEmail !== undefined && !isEmailLike(body.senderEmail)) {
    throw AppError.badRequest("Invalid senderEmail");
  }

  return body as {
    shop: string;
    token: string;
    shopifyId: string,
    name: string;
    email?: string;
    senderEmail?: string;
  };
}

export function validateUpdateShopInput(body: unknown) {
  if (!isRecord(body)) {
    throw AppError.badRequest("Request body is required");
  }

  const hasAnyField = ["name", "email", "senderEmail"].some((key) =>
    Object.prototype.hasOwnProperty.call(body, key),
  );

  if (!hasAnyField) {
    throw AppError.badRequest("At least one field is required");
  }

  if (body.name !== undefined && !isNonEmptyString(body.name)) {
    throw AppError.badRequest("name cannot be empty");
  }

  if (body.email !== undefined && !isEmailLike(body.email)) {
    throw AppError.badRequest("Invalid email");
  }

  if (body.senderEmail !== undefined && !isEmailLike(body.senderEmail)) {
    throw AppError.badRequest("Invalid senderEmail");
  }

  return body as {
    name?: string;
    email?: string;
    senderEmail?: string;
  };
}
