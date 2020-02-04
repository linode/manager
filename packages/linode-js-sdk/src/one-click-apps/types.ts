export interface OneClickApp {
    deployments_active: number;
    id: number;
    label: string;
    description: string;
    summary: string;
    images: string[];
    deployments_total: number;
    username: string;
    is_public: boolean;
    created: string;
    updated: string;
    script: string;
    user_defined_fields: UserDefinedField[];
    ordinal: number;
    color_logo_url: string;
    grey_logo_url: string;
    related_guides: Doc[];
    tips: string[];
    related_info: Doc[];
    href?: string;
}

export interface UserDefinedField {
    label: string;
    name: string;
    example?: string;
    oneof?: string;
    manyof?: string;
    default?: string;
}

export interface Doc {
    title: string;
    href: string;
}
  