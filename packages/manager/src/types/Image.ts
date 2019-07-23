namespace Linode {
  export interface Image {
    id: string;
    label: string;
    description: string | null;
    created: string;
    type: string;
    is_public: Boolean;
    size: number;
    created_by: null | string;
    vendor: string | null;
    deprecated: Boolean;
    expiry: null | string;
  }
}
