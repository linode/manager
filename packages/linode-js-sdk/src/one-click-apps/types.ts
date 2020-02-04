export interface OneClickApp {
    deployments_active: number;
    id: number;
    user_gravatar_id: string;
    label: string;
    description: string;
    images: string[];
    deployments_total: number;
    username: string;
    is_public: boolean;
    created: string;
    updated: string;
    rev_note: string;
    script: string;
    user_defined_fields: UserDefinedField[];
    ordinal: number;
    logo_url: string;
}

export interface UserDefinedField {
    label: string;
    name: string;
    example?: string;
    oneof?: string;
    manyof?: string;
    default?: string;
}
