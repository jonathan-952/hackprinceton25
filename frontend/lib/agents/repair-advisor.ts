/**
 * Repair Advisor Agent - Shop Finder Logic
 */

export interface RepairShop {
  id: string;
  name: string;
  specialty: string[];
  address: string;
  phone: string;
  rating: number;
  reviews_count: number;
  price_range: '$' | '$$' | '$$$';
  estimated_cost: number;
  turnaround_days: number;
  distance_miles: number;
  certifications: string[];
  hours: string;
}

export interface RepairAdvisorInput {
  incident_type: string;
  location: string;
  damage_total?: number;
  max_results?: number;
  price_preference?: '$' | '$$' | '$$$';
}

export interface RepairAdvisorOutput {
  shops: RepairShop[];
  total_found: number;
  search_location: string;
}

// Mock database of repair shops (in production, use Google Places API)
const mockShops: RepairShop[] = [
  {
    id: 'shop-1',
    name: "Joe's Auto Body & Repair",
    specialty: ['collision', 'paint', 'dent removal'],
    address: '123 Main St, Princeton, NJ 08540',
    phone: '(609) 555-0100',
    rating: 4.8,
    reviews_count: 342,
    price_range: '$$',
    estimated_cost: 1350,
    turnaround_days: 3,
    distance_miles: 2.4,
    certifications: ['I-CAR Gold', 'ASE Certified'],
    hours: 'Mon-Fri 8AM-6PM, Sat 9AM-3PM'
  },
  {
    id: 'shop-2',
    name: 'Princeton Collision Center',
    specialty: ['collision', 'frame repair', 'paint'],
    address: '456 Nassau St, Princeton, NJ 08542',
    phone: '(609) 555-0200',
    rating: 4.9,
    reviews_count: 578,
    price_range: '$$$',
    estimated_cost: 1650,
    turnaround_days: 2,
    distance_miles: 1.8,
    certifications: ['I-CAR Platinum', 'ASE Certified', 'Tesla Certified'],
    hours: 'Mon-Fri 7:30AM-6:30PM, Sat 8AM-4PM'
  },
  {
    id: 'shop-3',
    name: 'Route 1 Auto Works',
    specialty: ['collision', 'mechanical', 'paint'],
    address: '789 Route 1, Lawrence Township, NJ 08648',
    phone: '(609) 555-0300',
    rating: 4.6,
    reviews_count: 215,
    price_range: '$',
    estimated_cost: 980,
    turnaround_days: 5,
    distance_miles: 4.2,
    certifications: ['ASE Certified'],
    hours: 'Mon-Fri 8AM-5:30PM, Sat 9AM-2PM'
  },
  {
    id: 'shop-4',
    name: 'Elite European Auto Body',
    specialty: ['european cars', 'paint', 'luxury repairs'],
    address: '321 Alexander St, Princeton, NJ 08540',
    phone: '(609) 555-0400',
    rating: 4.7,
    reviews_count: 189,
    price_range: '$$$',
    estimated_cost: 1850,
    turnaround_days: 4,
    distance_miles: 2.1,
    certifications: ['I-CAR Platinum', 'BMW Certified', 'Mercedes Certified'],
    hours: 'Mon-Fri 8AM-6PM'
  },
  {
    id: 'shop-5',
    name: 'QuickFix Auto Body',
    specialty: ['quick repairs', 'dent removal', 'paint'],
    address: '567 College Rd, Princeton, NJ 08540',
    phone: '(609) 555-0500',
    rating: 4.4,
    reviews_count: 423,
    price_range: '$',
    estimated_cost: 850,
    turnaround_days: 2,
    distance_miles: 3.5,
    certifications: ['I-CAR Gold'],
    hours: 'Mon-Sat 8AM-7PM, Sun 10AM-4PM'
  }
];

/**
 * Find repair shops based on claim information
 */
export function findRepairShops(input: RepairAdvisorInput): RepairAdvisorOutput {
  const { max_results = 3, price_preference } = input;

  let filteredShops = [...mockShops];

  // Filter by price preference
  if (price_preference) {
    filteredShops = filteredShops.filter(shop => shop.price_range === price_preference);
  }

  // Filter by specialty based on incident type
  if (input.incident_type) {
    const type = input.incident_type.toLowerCase();
    if (type.includes('collision') || type.includes('accident')) {
      filteredShops = filteredShops.filter(shop =>
        shop.specialty.includes('collision')
      );
    }
  }

  // Sort by rating, then by distance
  filteredShops.sort((a, b) => {
    if (Math.abs(a.rating - b.rating) > 0.2) {
      return b.rating - a.rating;
    }
    return a.distance_miles - b.distance_miles;
  });

  // Update estimated costs based on damage total
  if (input.damage_total) {
    filteredShops = filteredShops.map(shop => ({
      ...shop,
      estimated_cost: calculateShopCost(input.damage_total!, shop.price_range)
    }));
  }

  return {
    shops: filteredShops.slice(0, max_results),
    total_found: filteredShops.length,
    search_location: input.location
  };
}

/**
 * Calculate shop-specific cost based on price range
 */
function calculateShopCost(baseCost: number, priceRange: '$' | '$$' | '$$$'): number {
  const multipliers = {
    '$': 0.85,
    '$$': 1.0,
    '$$$': 1.25
  };

  return Math.round(baseCost * multipliers[priceRange]);
}

/**
 * Filter shops by specialty
 */
export function filterBySpecialty(
  specialty: string,
  max_results: number = 3
): RepairShop[] {
  const filtered = mockShops.filter(shop =>
    shop.specialty.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
  );

  return filtered.slice(0, max_results);
}

/**
 * Get shop recommendations with reasoning
 */
export function getRecommendations(input: RepairAdvisorInput): {
  top_pick: RepairShop;
  budget_option: RepairShop;
  premium_option: RepairShop;
  reasoning: Record<string, string>;
} {
  const result = findRepairShops({ ...input, max_results: 10 });
  const shops = result.shops;

  // Top pick: best rating within reasonable price
  const topPick = shops.filter(s => s.price_range === '$$')[0] || shops[0];

  // Budget option: lowest price with decent rating
  const budgetOption = shops
    .filter(s => s.price_range === '$' && s.rating >= 4.3)
    .sort((a, b) => a.estimated_cost - b.estimated_cost)[0] || shops[shops.length - 1];

  // Premium option: highest rated
  const premiumOption = shops
    .filter(s => s.price_range === '$$$')
    .sort((a, b) => b.rating - a.rating)[0] || shops[0];

  return {
    top_pick: topPick,
    budget_option: budgetOption,
    premium_option: premiumOption,
    reasoning: {
      top_pick: `Best balance of quality (${topPick.rating}/5) and value. ${topPick.certifications.join(', ')}`,
      budget_option: `Most affordable option at $${budgetOption.estimated_cost}. ${budgetOption.turnaround_days} day turnaround`,
      premium_option: `Highest quality with ${premiumOption.rating}/5 rating. ${premiumOption.certifications.join(', ')}`
    }
  };
}
