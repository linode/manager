namespace Linode {
  export interface Image {
    id: string;
    label: string;
    description: string | null;
    created: string;
    type: ImageType;
    is_public: Boolean;
    size: number;
    created_by: string;
    vendor: string | null;
    deprecated: Boolean;
  }

  type ImageType = 'manual' | 'automatic';
}
