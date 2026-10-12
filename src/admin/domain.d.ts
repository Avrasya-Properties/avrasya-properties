import type { DB, Contact, Deal, Property, SiteSettings } from "./store";
export function requireText(value: unknown, label: string, max?: number): string;
export function requireEnum<T>(value: T, values: readonly T[], label: string): T;
export function requireAmount(value: unknown, label: string, allowNull?: boolean): void;
export function requireDate(value: unknown, label: string): void;
export function contactMatch(a: Pick<Contact, "email" | "phone">, b: Pick<Contact, "email" | "phone">): boolean;
export function exactBudget(text: string): { amount: number; currency: "USD" | "EUR" | "TRY" | "GBP" } | null;
export function validateSettings(settings: SiteSettings): SiteSettings;
export function validateWorkspace(input: unknown): DB;
export function validateDealSelection(deal: Deal, properties: Property[], otherDeals: Deal[]): Property[];

export function istanbulDateTime(value: string): string;
export function currencyTotals(records: readonly { amount: number | null; currency: string | null }[]): Partial<Record<"USD" | "EUR" | "TRY" | "GBP", number>>;
