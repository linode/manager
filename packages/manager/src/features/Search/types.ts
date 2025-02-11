import type { SelectOption } from '@linode/ui';

export interface ResultRowDataOption extends SelectOption {
  data: {
    created: string;
    description: string;
    path: string;
    region: string;
    tags: string[];
  };
}
