import { Rule } from "server/models/Rule.js";

export interface RuleDTO {
    id: string;
    name: string;
    status: string;
    priority: number;
    productCondition: {
        type: string;
        tags: string[];
    };
    discount: {
        type: string;
        value: number;
    };
    createdAt: string;
    updatedAt: string;
}

export function toRuleDTO(rule: Rule): RuleDTO {
    return {
        id: String(rule.id),
        name: rule.name,
        status: rule.status,
        priority: rule.priority,
        productCondition: {
            type: rule.productConditionType,
            tags: rule.productTags || [],
        },
        discount: {
            type: rule.discountType,
            value: Number(rule.discountValue),
        },
        createdAt: rule.createdAt.toISOString(),
        updatedAt: rule.updatedAt.toISOString(),
    }
}