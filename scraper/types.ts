export type ParkingCategory = "A" | "B" | "C" | "D" | "E";

export type FacilityCategory =
  | "complex"
  | "supermarket"
  | "museum"
  | "onsen"
  | "park"
  | "zoo"
  | "homeimprovement"
  | "cinema"
  | "farm"
  | "library"
  | "roadstop";

export type ParkingDetails = {
  totalSpaces?: number;
  freeMinutes?: number;
  freeCondition?: string;
  paidRate?: string;
  notes?: string;
};

export type ScrapedFacility = {
  name: string;
  category: FacilityCategory;
  address: string;
  prefecture: string;
  city: string;
  lat: number;
  lng: number;
  website?: string;
  phone?: string;
  hours?: string;
  parkingCategory: ParkingCategory;
  parkingDetails: ParkingDetails;
  source: string;
};

export type ScrapeResult = {
  facilities: ScrapedFacility[];
  errors: string[];
};
