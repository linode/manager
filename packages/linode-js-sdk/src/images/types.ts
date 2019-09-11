export interface Image {
  id: string;
  label: string;
  description: string | null;
  created: string;
  type: string;
  is_public: boolean;
  size: number;
  created_by: null | string;
  vendor: string | null;
  deprecated: boolean;
  expiry: null | string;
}
