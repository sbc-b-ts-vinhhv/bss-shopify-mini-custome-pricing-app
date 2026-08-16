import { AppError } from "../utils/AppError.js";
import type {
  DiscountType,
  ProductConditionType,
  RuleStatus,
} from "../models/Rule.js";

const RULE_STATUSES: RuleStatus[] = ["enabled", "disabled"];
const PRODUCT_CONDITION_TYPES: ProductConditionType[] = ["ALL", "TAGS"];
const DISCOUNT_TYPES: DiscountType[] = [
  "FIXED_PRICE",
  "DECREASE_FIXED",
  "DECREASE_PERCENTAGE",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isValidEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function parseDate(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

export function validateDiscountValue(
  discountType: DiscountType,
  discountValue: unknown,
): string | null {
  if (!isFiniteNumber(discountValue)) {
    return "discountValue must be a valid number";
  }

  if (discountValue < 0) {
    return "discountValue cannot be negative";
  }

  if (discountType === "DECREASE_PERCENTAGE") {
    if (discountValue <= 0 || discountValue > 100) {
      return "discountValue must be greater than 0 and less than or equal to 100 for percentage discount";
    }
  }

  return null;
}

export function validateCreateRuleInput(body: unknown) {
  if (!isRecord(body)) {
    throw AppError.badRequest("Request body is required");
  }

  if (!isNonEmptyString(body.name)) {
    throw AppError.badRequest("name is required");
  }

  if (
    body.status !== undefined &&
    !isValidEnum(body.status, RULE_STATUSES)
  ) {
    throw AppError.badRequest("Invalid status");
  }

  if (body.priority !== undefined && !isNonNegativeInteger(body.priority)) {
    throw AppError.badRequest("priority must be a non-negative integer");
  }

  if (
    !isValidEnum(body.productConditionType, PRODUCT_CONDITION_TYPES)
  ) {
    throw AppError.badRequest("Invalid productConditionType");
  }

  if (!isValidEnum(body.discountType, DISCOUNT_TYPES)) {
    throw AppError.badRequest("Invalid discountType");
  }

  const discountError = validateDiscountValue(body.discountType, body.discountValue);
  if (discountError) {
    throw AppError.badRequest(discountError);
  }

  if (body.productConditionType === "TAGS") {
    if (!isStringArray(body.productTags) || body.productTags.length === 0) {
      throw AppError.badRequest(
        "productTags is required when productConditionType is TAGS",
      );
    }

    if (body.productTags.some((tag) => tag.trim().length === 0)) {
      throw AppError.badRequest("productTags cannot contain empty strings");
    }
  } else if (body.productTags !== undefined) {
    if (!isStringArray(body.productTags)) {
      throw AppError.badRequest("productTags must be an array of strings");
    }
  }

  if (!parseDate(body.endAt)) {
    throw AppError.badRequest("Invalid endAt");
  }

  return body as {
    name: string;
    status?: RuleStatus;
    priority?: number;
    productConditionType: ProductConditionType;
    productTags?: string[];
    discountType: DiscountType;
    discountValue: number;
    endAt?: string | null;
  };
}

export function validateUpdateRuleInput(body: unknown) {
  if (!isRecord(body)) {
    throw AppError.badRequest("Request body is required");
  }

  const hasAnyField = [
    "name",
    "status",
    "priority",
    "productConditionType",
    "productTags",
    "discountType",
    "discountValue",
    "endAt",
  ].some((key) => Object.prototype.hasOwnProperty.call(body, key));

  if (!hasAnyField) {
    throw AppError.badRequest("At least one field is required");
  }

  if (body.name !== undefined && !isNonEmptyString(body.name)) {
    throw AppError.badRequest("name cannot be empty");
  }

  if (
    body.status !== undefined &&
    !isValidEnum(body.status, RULE_STATUSES)
  ) {
    throw AppError.badRequest("Invalid status");
  }

  if (body.priority !== undefined && !isNonNegativeInteger(body.priority)) {
    throw AppError.badRequest("priority must be a non-negative integer");
  }

  if (
    body.productConditionType !== undefined &&
    !isValidEnum(body.productConditionType, PRODUCT_CONDITION_TYPES)
  ) {
    throw AppError.badRequest("Invalid productConditionType");
  }

  if (body.productTags !== undefined) {
    if (!isStringArray(body.productTags)) {
      throw AppError.badRequest("productTags must be an array of strings");
    }

    if (body.productTags.some((tag) => tag.trim().length === 0)) {
      throw AppError.badRequest("productTags cannot contain empty strings");
    }
  }

  if (
    body.productConditionType === "TAGS" &&
    (!isStringArray(body.productTags) || body.productTags.length === 0)
  ) {
    throw AppError.badRequest(
      "productTags is required when productConditionType is TAGS",
    );
  }

  if (
    body.discountType !== undefined &&
    !isValidEnum(body.discountType, DISCOUNT_TYPES)
  ) {
    throw AppError.badRequest("Invalid discountType");
  }

  if (body.discountValue !== undefined) {
    const discountType = isValidEnum(body.discountType, DISCOUNT_TYPES)
      ? body.discountType
      : undefined;

    if (discountType) {
      const discountError = validateDiscountValue(
        discountType,
        body.discountValue,
      );
      if (discountError) {
        throw AppError.badRequest(discountError);
      }
    } else if (!isFiniteNumber(body.discountValue) || body.discountValue < 0) {
      throw AppError.badRequest("discountValue must be a non-negative number");
    }
  }

  if (!parseDate(body.endAt)) {
    throw AppError.badRequest("Invalid endAt");
  }

  return body as {
    name?: string;
    status?: RuleStatus;
    priority?: number;
    productConditionType?: ProductConditionType;
    productTags?: string[];
    discountType?: DiscountType;
    discountValue?: number;
    endAt?: string | null;
  };
}
