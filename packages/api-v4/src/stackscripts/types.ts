export interface StackScriptPayload {
  description?: string;
  images: string[];
  is_public?: boolean;
  label: string;
  rev_note?: string;
  script: string;
}

export interface StackScript {
  created: string;
  deployments_active: number;
  deployments_total: number;
  description: string;
  id: number;
  images: string[];
  is_public: boolean;
  label: string;
  logo_url: string;
  mine: boolean;
  ordinal: number;
  rev_note: string;
  script: string;
  updated: string;
  user_defined_fields: UserDefinedField[];
  user_gravatar_id: string;
  username: string;
}

export interface UserDefinedField {
  default?: string;
  example?: string;
  header?: string;
  label: string;
  manyof?: string;
  name: string;
  oneof?: string;
}
