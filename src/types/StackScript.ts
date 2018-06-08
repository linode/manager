namespace Linode {
  export namespace StackScript {
    export interface Response {
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
      user_defined_fields: any[];
    }

    export type Request = any;
  }
}

