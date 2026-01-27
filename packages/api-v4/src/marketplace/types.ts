export interface MarketplaceProductDetail {
  documentation: string;
  overview: {
    description: string;
  };
  pricing: string;
  support: string;
}

export interface MarketplaceProduct {
  category_ids: number[];
  details?: MarketplaceProductDetail;
  id: number;
  info_banner?: string;
  name: string;
  partner_id: number;
  product_tags?: string[];
  short_description: string;
  title_tag?: string;
  type_id: number;
}

export interface MarketplaceCategory {
  category: string;
  id: number;
  product_count: number;
}

export interface MarketplaceType {
  id: number;
  name: string;
  product_count: number;
}

export interface MarketplacePartner {
  id: number;
  logo_url_light_mode: string;
  logo_url_night_mode?: string;
  name: string;
  url: string;
}

export interface MarketplacePartnerReferralPayload {
  account_executive_email?: string;
  additional_emails?: string[];
  comments?: string;
  company_name?: string;
  country_code: string;
  email: string;
  name: string;
  partner_id: number;
  phone: string;
  phone_country_code: string;
  tc_consent_given: boolean;
}
