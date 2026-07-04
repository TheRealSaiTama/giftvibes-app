interface PriceOverride {
  minPrice: number | null;
  maxPrice: number | null;
}

const PRICE_OVERRIDES: Record<string, PriceOverride> = {
  "premium leather engineering diary with planner": { minPrice: 154, maxPrice: 167 },
};

export function getPriceOverride(productName: string | undefined | null): PriceOverride | null {
  if (!productName) {
    return null;
  }

  const key = productName.trim().toLowerCase();
  return PRICE_OVERRIDES[key] ?? null;
}
