declare module '@linode/validation/account.schema' {
  export const updateAccountSchema: import("yup").ObjectSchema<{
      email: string;
      address_1: string;
      city: string;
      company: string;
      country: string;
      first_name: string;
      last_name: string;
      address_2: string;
      phone: string;
      state: string;
      tax_id: string;
      zip: string;
  }>;
  export const createOAuthClientSchema: import("yup").ObjectSchema<{
      label: string;
      redirect_uri: string;
  }>;
  export const updateOAuthClientSchema: import("yup").ObjectSchema<{
      label: string;
      redirect_uri: string;
  }>;
  export const StagePaypalPaymentSchema: import("yup").ObjectSchema<{
      cancel_url: string;
      redirect_url: string;
      usd: string;
  }>;
  export const ExecutePaypalPaymentSchema: import("yup").ObjectSchema<{
      payer_id: string;
      payment_id: string;
  }>;
  export const PaymentSchema: import("yup").ObjectSchema<{
      usd: string;
  }>;
  export const CreditCardSchema: import("yup").ObjectSchema<{
      card_number: string;
      expiry_year: number;
      expiry_month: number;
      cvv: string;
  }>;
  export const CreateUserSchema: import("yup").ObjectSchema<{
      username: string;
      email: string;
      restricted: boolean;
  }>;
  export const UpdateUserSchema: import("yup").ObjectSchema<{
      username: string;
      email: string;
      restricted: boolean;
  }>;
  export const UpdateGrantSchema: import("yup").ObjectSchema<{
      global: object;
      linode: {
          id: any;
          permissions: any;
      }[];
      domain: {
          id: any;
          permissions: any;
      }[];
      nodebalancer: {
          id: any;
          permissions: any;
      }[];
      image: {
          id: any;
          permissions: any;
      }[];
      longview: {
          id: any;
          permissions: any;
      }[];
      stackscript: {
          id: any;
          permissions: any;
      }[];
      volume: {
          id: any;
          permissions: any;
      }[];
  }>;
  export const UpdateAccountSettingsSchema: import("yup").ObjectSchema<{
      network_helper: boolean;
      backups_enabled: boolean;
      managed: boolean;
  }>;

}
declare module '@linode/validation/buckets.schema' {
  export const CreateBucketSchema: import("yup").ObjectSchema<{
      label: string;
      cluster: string;
  }>;
  export const UploadCertificateSchema: import("yup").ObjectSchema<{
      certificate: string;
      private_key: string;
  }>;
  export const UpdateBucketAccessSchema: import("yup").ObjectSchema<{
      acl: string | undefined;
      cors_enabled: boolean | undefined;
  }>;

}
declare module '@linode/validation/constants' {
  export const MAX_VOLUME_SIZE = 10240;

}
declare module '@linode/validation/databases.schema' {
  export const maintenanceScheduleSchema: import("yup").ObjectSchema<{
      day: any;
      window: any;
  } | undefined>;
  export const createDatabaseSchema: import("yup").ObjectSchema<{
      label: string | undefined;
      region: string;
      type: string;
      root_password: string;
      tags: string[];
      maintenance_schedule: {
          day: any;
          window: any;
      } | undefined;
  }>;
  export const updateDatabaseSchema: import("yup").ObjectSchema<{
      label: string | undefined;
      tags: string[] | undefined;
      maintenance_schedule: {
          day: any;
          window: any;
      } | undefined;
  }>;
  export const resetPasswordSchema: import("yup").ObjectSchema<{
      root_password: string;
  }>;

}
declare module '@linode/validation/domains.schema' {
  export const importZoneSchema: import("yup").ObjectSchema<{
      domain: string;
      remote_nameserver: string;
  }>;
  export const createDomainSchema: import("yup").ObjectSchema<{
      domain: string;
      status: any;
      tags: string[];
      description: string;
      retry_sec: number;
      master_ips: string[];
      axfr_ips: string[];
      expire_sec: number;
      refresh_sec: number;
      ttl_sec: number;
  } & {
      domain: string;
      tags: string[];
      type: any;
      soa_email: string;
      master_ips: string[];
  }>;
  export const updateDomainSchema: import("yup").ObjectSchema<{
      domain: string;
      status: any;
      tags: string[];
      description: string;
      retry_sec: number;
      master_ips: string[];
      axfr_ips: string[];
      expire_sec: number;
      refresh_sec: number;
      ttl_sec: number;
  } & {
      domainId: number;
      soa_email: string;
      axfr_ips: string[];
      tags: string[];
  }>;

}
declare module '@linode/validation/firewalls.schema' {
  export const IP_ERROR_MESSAGE = "Must be a valid IPv4 or IPv6 address or range.";
  export const validateIP: (ipAddress: string) => boolean;
  export const CreateFirewallDeviceSchema: import("yup").ObjectSchema<{
      linodes: number[];
      nodebalancers: number[];
  }>;
  export const ipAddress: import("yup").StringSchema<string>;
  export const validateFirewallPorts: import("yup").StringSchema<string>;
  export const FirewallRuleTypeSchema: import("yup").ObjectSchema<object & {
      action: any;
      protocol: any;
      ports: string;
      addresses: (object & {
          ipv4: any;
          ipv6: any;
      }) | null;
  }>;
  export const FirewallRuleSchema: import("yup").ObjectSchema<object & {
      inbound: (object & {
          action: any;
          protocol: any;
          ports: any;
          addresses: any;
      })[] | null;
      outbound: (object & {
          action: any;
          protocol: any;
          ports: any;
          addresses: any;
      })[] | null;
      inbound_policy: any;
      outbound_policy: any;
  }>;
  export const CreateFirewallSchema: import("yup").ObjectSchema<object & {
      label: string;
      tags: string[];
      rules: object & {
          inbound: any;
          outbound: any;
          inbound_policy: any;
          outbound_policy: any;
      };
  }>;
  export const UpdateFirewallSchema: import("yup").ObjectSchema<object & {
      label: string;
      tags: string[];
      status: string;
  }>;
  export const FirewallDeviceSchema: import("yup").ObjectSchema<{
      type: string;
      id: number;
  }>;

}
declare module '@linode/validation/images.schema' {
  export const createImageSchema: import("yup").ObjectSchema<object & {
      disk_id: number;
      label: string | undefined;
      description: string | undefined;
  }>;
  export const updateImageSchema: import("yup").ObjectSchema<object & {
      label: string | undefined;
      description: string | undefined;
  }>;

}
declare module '@linode/validation/index' {
  export * from '@linode/validation/account/index';
  export * from '@linode/validation/buckets/index';
  export * from '@linode/validation/databases/index';
  export * from '@linode/validation/domains/index';
  export * from '@linode/validation/firewalls/index';
  export * from '@linode/validation/kubernetes/index';
  export * from '@linode/validation/linodes/index';
  export * from '@linode/validation/longview/index';
  export * from '@linode/validation/managed/index';
  export * from '@linode/validation/networking/index';
  export * from '@linode/validation/nodebalancers/index';
  export * from '@linode/validation/objectStorageKeys/index';
  export * from '@linode/validation/profile/index';
  export * from '@linode/validation/records/index';
  export * from '@linode/validation/stackscripts/index';
  export * from '@linode/validation/support/index';
  export * from '@linode/validation/transfers/index';
  export * from '@linode/validation/twofactor/index';
  export * from '@linode/validation/vlans/index';
  export * from '@linode/validation/volumes/index';

}
declare module '@linode/validation/kubernetes.schema' {
  export const nodePoolSchema: import("yup").ObjectSchema<object & {
      type: string;
      count: number;
  }>;
  export const clusterLabelSchema: import("yup").StringSchema<string>;
  export const createKubeClusterSchema: import("yup").ObjectSchema<object & {
      label: string;
      region: string;
      k8s_version: string;
      node_pools: (object & {
          type: any;
          count: any;
      })[];
  }>;

}
declare module '@linode/validation/linodes.schema' {
  /**
   * Interfaces are Record<string, InterfaceItem>
   *
   * {
   *  "eth0": { "id": 10 },
   *  "eth1": { "id": 12 }
   * }
   *
   * .default() and .lazy() below are required to
   * make this dynamic field naming work out
   */
  export const linodeInterfaceItemSchema: import("yup").ObjectSchema<{
      id: number;
  }>;
  export const linodeInterfaceSchema: import("yup").Lazy;
  export const ResizeLinodeDiskSchema: import("yup").ObjectSchema<{
      size: number;
  }>;
  export const UpdateLinodePasswordSchema: import("yup").ObjectSchema<{
      password: string;
  }>;
  export const CreateLinodeSchema: import("yup").ObjectSchema<{
      type: string;
      region: string;
      stackscript_id: number | undefined;
      backup_id: number | undefined;
      swap_size: number | undefined;
      image: string | undefined;
      authorized_keys: string[] | undefined;
      backups_enabled: boolean | undefined;
      stackscript_data: object[] | null;
      booted: boolean | undefined;
      label: string | undefined;
      tags: string[] | undefined;
      private_ip: boolean | undefined;
      authorized_users: string[] | undefined;
      root_pass: string;
      interfaces: any;
  }>;
  export const UpdateLinodeSchema: import("yup").ObjectSchema<{
      label: string | undefined;
      tags: string[] | undefined;
      watchdog_enabled: boolean | undefined;
      alerts: {
          cpu: any;
          network_in: any;
          network_out: any;
          transfer_quota: any;
          io: any;
      } | undefined;
      backups: {
          schedule: any;
          enabled: any;
      };
  }>;
  export const RebuildLinodeSchema: import("yup").ObjectSchema<object & {
      image: string;
      root_pass: string;
      authorized_keys: {
          id: any;
          label: any;
          ssh_key: any;
          created: any;
      }[];
      authorized_users: string[];
      stackscript_id: number | undefined;
      stackscript_data: object[] | null;
      booted: boolean | undefined;
  }>;
  export const RebuildLinodeFromStackScriptSchema: import("yup").ObjectSchema<{
      image: string;
      root_pass: string;
      authorized_keys: {
          id: number;
          label: string;
          ssh_key: string;
          created: string;
      }[];
      authorized_users: string[];
      stackscript_id: number;
      stackscript_data: object[] | null;
      booted: boolean | undefined;
  } & {
      stackscript_id: number;
  }>;
  export const IPAllocationSchema: import("yup").ObjectSchema<{
      type: string;
      public: boolean;
  }>;
  export const CreateSnapshotSchema: import("yup").ObjectSchema<{
      label: string;
  }>;
  export const CreateLinodeConfigSchema: import("yup").ObjectSchema<{
      label: string;
      devices: {
          sda: any;
          sdb: any;
          sdc: any;
          sdd: any;
          sde: any;
          sdf: any;
          sdg: any;
          sdh: any;
      };
      kernel: string;
      comments: string;
      memory_limit: number;
      run_level: any;
      virt_mode: any;
      helpers: {
          updatedb_disabled: any;
          distro: any;
          modules_dep: any;
          network: any;
          devtmpfs_automount: any;
      };
      root_device: string;
      interfaces: any;
  }>;
  export const UpdateLinodeConfigSchema: import("yup").ObjectSchema<{
      label: string;
      devices: {
          sda: any;
          sdb: any;
          sdc: any;
          sdd: any;
          sde: any;
          sdf: any;
          sdg: any;
          sdh: any;
      };
      kernel: string;
      comments: string;
      memory_limit: number;
      run_level: any;
      virt_mode: any;
      helpers: {
          updatedb_disabled: any;
          distro: any;
          modules_dep: any;
          network: any;
          devtmpfs_automount: any;
      };
      root_device: string;
      interfaces: any;
  }>;
  export const CreateLinodeDiskSchema: import("yup").ObjectSchema<{
      size: number;
      label: string;
      filesystem: any;
      read_only: boolean;
      image: string;
      authorized_keys: string[];
      authorized_users: string[];
      root_pass: string;
      stackscript_id: number;
      stackscript_data: object[] | null;
  }>;
  export const UpdateLinodeDiskSchema: import("yup").ObjectSchema<{
      label: string | undefined;
      filesystem: any;
  }>;
  export const CreateLinodeDiskFromImageSchema: import("yup").ObjectSchema<{
      size: number;
      label: string;
      filesystem: any;
      read_only: boolean;
      image: string;
      authorized_keys: string[];
      authorized_users: string[];
      root_pass: string;
      stackscript_id: number;
      stackscript_data: object[] | null;
  } & {
      image: string;
  }>;

}
declare module '@linode/validation/longview.schema' {
  export const longviewClientCreate: import("yup").ObjectSchema<object & {
      label: string;
  }>;

}
declare module '@linode/validation/managed.schema' {
  export const createServiceMonitorSchema: import("yup").ObjectSchema<object & {
      label: string;
      service_type: any;
      address: string;
      timeout: number;
      credentials: number[] | undefined;
      notes: string | undefined;
      consultation_group: string | undefined;
      body: string | undefined;
  }>;
  export const sshSettingSchema: import("yup").ObjectSchema<object & {
      access: boolean;
      user: string;
      ip: string;
      port: number;
  }>;
  export const updateManagedLinodeSchema: import("yup").ObjectSchema<{
      ssh: object & {
          access: any;
          user: any;
          ip: any;
          port: any;
      };
  }>;
  export const credentialLabel: import("yup").StringSchema<string>;
  export const credentialPassword: import("yup").StringSchema<string | undefined>;
  export const credentialUsername: import("yup").StringSchema<string | undefined>;
  export const createCredentialSchema: import("yup").ObjectSchema<object & {
      label: string;
      username: string | undefined;
      password: string | undefined;
  }>;
  export const updateCredentialSchema: import("yup").ObjectSchema<object & {
      label: string;
  }>;
  export const updatePasswordSchema: import("yup").ObjectSchema<object & {
      username: string | undefined;
      password: string;
  }>;
  export const createContactSchema: import("yup").ObjectSchema<object & {
      name: string;
      email: string;
      phone: (object & {
          primary: any;
          secondary: any;
      }) | undefined;
      group: string | null | undefined;
  }>;

}
declare module '@linode/validation/networking.schema' {
  export const updateIPSchema: import("yup").ObjectSchema<object & {
      rdns: string | null | undefined;
  }>;
  export const allocateIPSchema: import("yup").ObjectSchema<object & {
      type: string;
      public: boolean;
      linode_id: number;
  }>;
  export const assignAddressesSchema: import("yup").ObjectSchema<object & {
      region: string;
      assignments: object[];
  }>;
  export const shareAddressesSchema: import("yup").ObjectSchema<object & {
      linode_id: number;
      ips: string[];
  }>;

}
declare module '@linode/validation/nodebalancers.schema' {
  export const nodeBalancerConfigNodeSchema: import("yup").ObjectSchema<{
      label: string;
      address: string;
      port: number;
      weight: number;
      mode: any;
  }>;
  export const createNodeBalancerConfigSchema: import("yup").ObjectSchema<{
      algorithm: any;
      check_attempts: number;
      check_body: string;
      check_interval: number;
      check_passive: boolean;
      check_path: string;
      proxy_protocol: string;
      check_timeout: number;
      check: any;
      cipher_suite: any;
      port: number;
      protocol: any;
      ssl_key: string;
      ssl_cert: string;
      stickiness: any;
      nodes: {
          label: any;
          address: any;
          port: any;
          weight: any;
          mode: any;
      }[];
  }>;
  export const UpdateNodeBalancerConfigSchema: import("yup").ObjectSchema<{
      algorithm: any;
      check_attempts: number;
      check_body: string;
      check_interval: number;
      check_passive: boolean;
      check_path: string;
      proxy_protocol: string;
      check_timeout: number;
      check: any;
      cipher_suite: any;
      port: number;
      protocol: any;
      ssl_key: string;
      ssl_cert: string;
      stickiness: any;
      nodes: {
          label: any;
          address: any;
          port: any;
          weight: any;
          mode: any;
      }[];
  }>;
  export const NodeBalancerSchema: import("yup").ObjectSchema<{
      label: string;
      client_conn_throttle: number;
      region: string;
      configs: {
          algorithm: any;
          check_attempts: any;
          check_body: any;
          check_interval: any;
          check_passive: any;
          check_path: any;
          proxy_protocol: any;
          check_timeout: any;
          check: any;
          cipher_suite: any;
          port: any;
          protocol: any;
          ssl_key: any;
          ssl_cert: any;
          stickiness: any;
          nodes: any;
      }[];
  }>;
  export const UpdateNodeBalancerSchema: import("yup").ObjectSchema<{
      label: string;
      client_conn_throttle: number;
      region: string;
  }>;

}
declare module '@linode/validation/objectStorageKeys.schema' {
  export const createObjectStorageKeysSchema: import("yup").ObjectSchema<{
      label: string;
  }>;

}
declare module '@linode/validation/profile.schema' {
  export const createPersonalAccessTokenSchema: import("yup").ObjectSchema<{
      scopes: string;
      expiry: string;
      label: string;
  }>;
  export const createSSHKeySchema: import("yup").ObjectSchema<{
      label: string;
      ssh_key: string;
  }>;
  export const updateProfileSchema: import("yup").ObjectSchema<{
      email: string;
      timezone: string;
      email_notifications: boolean;
      authorized_keys: string[];
      restricted: boolean;
      two_factor_auth: boolean;
      lish_auth_method: string;
      authentication_type: string;
  }>;

}
declare module '@linode/validation/records.schema' {
  export const createRecordSchema: import("yup").ObjectSchema<{
      name: string;
      target: string;
      priority: number;
      weight: number;
      port: number;
      service: string | null;
      protocol: string | null;
      ttl_sec: number;
      tag: string;
  } & {
      type: any;
  }>;
  export const updateRecordSchema: import("yup").ObjectSchema<{
      name: string;
      target: string;
      priority: number;
      weight: number;
      port: number;
      service: string | null;
      protocol: string | null;
      ttl_sec: number;
      tag: string;
  } & object>;

}
declare module '@linode/validation/stackscripts.schema' {
  export const stackScriptSchema: import("yup").ObjectSchema<{
      script: string;
      label: string;
      images: string[];
      description: string;
      is_public: boolean;
      rev_note: string;
  }>;
  export const updateStackScriptSchema: import("yup").ObjectSchema<{
      script: string;
      label: string;
      images: string[];
      description: string;
      is_public: boolean;
      rev_note: string;
  }>;

}
declare module '@linode/validation/support.schema' {
  export const createSupportTicketSchema: import("yup").ObjectSchema<{
      summary: string;
      description: string;
      domain_id: number;
      linode_id: number;
      longviewclient_id: number;
      nodebalancer_id: number;
      volume_id: number;
  }>;
  export const createReplySchema: import("yup").ObjectSchema<{
      description: string;
  }>;

}
declare module '@linode/validation/transfers.schema' {
  export const CreateTransferSchema: import("yup").ObjectSchema<{
      entities: {
          linodes: any;
      };
  }>;

}
declare module '@linode/validation/twofactor.schema' {
  export const enableTwoFactorSchema: import("yup").ObjectSchema<{
      tfa_code: string;
  }>;

}
declare module '@linode/validation/vlans.schema' {
  export const createVlanSchema: import("yup").ObjectSchema<{
      description: string | undefined;
      region: string;
      linodes: number[];
  }>;

}
declare module '@linode/validation/volumes.schema' {
  export const CreateVolumeSchema: import("yup").ObjectSchema<{
      region: string;
      linode_id: number;
      size: number;
      label: string;
      config_id: number;
      tags: string[];
  }>;
  export const CloneVolumeSchema: import("yup").ObjectSchema<{
      label: string;
  }>;
  export const ResizeVolumeSchema: (minSize?: number) => import("yup").ObjectSchema<{
      size: number;
  }>;
  export const UpdateVolumeSchema: import("yup").ObjectSchema<{
      label: string;
  }>;
  export const AttachVolumeSchema: import("yup").ObjectSchema<{
      linode_id: number;
      config_id: number;
  }>;

}
declare module '@linode/validation' {
  import main = require('@linode/validation/index');
  export = main;
}