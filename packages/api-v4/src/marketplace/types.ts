export interface MarketplaceProductDetail {
  documentation: {
    description: string;
  };
  overview: {
    description: string;
  };
  pricing: {
    description: string;
  };
  support: {
    description: string;
  };
}

export interface MarketplaceProduct {
  category_ids: number[];
  created_at: string;
  created_by: string;
  details?: MarketplaceProductDetail;
  id: number;
  info_banner?: string;
  logo_url: string;
  name: string;
  partner_id: number;
  product_tags?: string[];
  short_description: string;
  tile_tag?: string;
  type_id: number;
  updated_at?: string;
  updated_by?: string;
}

export interface MarketplaceCategory {
  created_at: string;
  created_by: string;
  id: number;
  name: string;
  products_count: number;
  updated_at?: string;
  updated_by?: string;
}

export interface MarketplaceType {
  created_at: string;
  created_by: string;
  id: number;
  name: string;
  products_count: number;
  updated_at?: string;
  updated_by?: string;
}

export interface MarketplacePartner {
  created_at: string;
  created_by: string;
  id: number;
  logo_url_dark_mode: string;
  logo_url_light_mode: string;
  name: string;
  updated_at?: string;
  updated_by?: string;
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
