type CategoryHref = string | {
  pathname: string;
  query?: Record<string, string | string[]>;
};

const categoryHrefMap: Record<string, CategoryHref> = {
  'CORPORATE GIFT SETS': { pathname: '/shop', query: { category: 'Corporate Gift Set' } },
  'NEW YEAR DIARY BOOKS': { pathname: '/shop', query: { category: 'NEW YEAR DIARY' } },
  'NEW YEAR DIARY': { pathname: '/shop', query: { category: 'NEW YEAR DIARY' } },
  'CUSTOMISED DIARY & NOTE BOOKS': { pathname: '/shop', query: { category: 'NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS' } },
  'CUSTOMISED DIARY AND NOTE BOOKS': { pathname: '/shop', query: { category: 'NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS' } },
  'Premium Diary': { pathname: '/shop', query: { category: 'NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS' } },
  'New Year Diary': { pathname: '/shop', query: { category: 'NEW YEAR DIARY' } },
  'Corporate Gift Sets': { pathname: '/shop', query: { category: 'Corporate Gift Set' } },
  'Best Seller Corporate Gifts': { pathname: '/shop', query: { category: 'Corporate Gift Set' } },
};

const fallbackHref: CategoryHref = '/shop';

export function getCategoryHref(label: string): CategoryHref {
  const normalized = label.trim();
  return categoryHrefMap[normalized] ?? fallbackHref;
}

export function hasCategoryProducts(label: string): boolean {
  return getCategoryHref(label) !== fallbackHref;
}
