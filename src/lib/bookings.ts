export const spotsLabel = (spots: number) =>
  `${spots} ${spots === 1 ? 'spot' : 'spots'}`;

// A slot's price is per spot. Rounded to cents so 3 × 0.1 doesn't show as 0.30000000000000004
export const bookingTotal = (pricePerSpot: number, spots: number) =>
  Math.round(pricePerSpot * spots * 100) / 100;
