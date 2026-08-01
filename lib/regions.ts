/** UK regions used for browsing ambassadors and tagging profiles/dreams. */
export const UK_REGIONS = [
  "London",
  "South East",
  "South West",
  "East of England",
  "East Midlands",
  "West Midlands",
  "Yorkshire",
  "North West",
  "North East",
  "Scotland",
  "Wales",
  "Northern Ireland",
] as const;

export type UkRegion = (typeof UK_REGIONS)[number];
