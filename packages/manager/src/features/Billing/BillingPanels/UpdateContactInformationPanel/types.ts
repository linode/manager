export interface CountryData {
  countries: Country[];
}

export interface Country {
  countryName: string;
  countryShortCode: string;
  regions: Region[];
}

export interface Region {
  name: string;
  shortCode?: string;
}
