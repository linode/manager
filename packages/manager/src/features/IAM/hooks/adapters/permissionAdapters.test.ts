import {
  entityPermissionMapFrom,
  fromGrants,
  toEntityPermissionMap,
  toPermissionMap,
} from './permissionAdapters';

import type { Grants, PermissionType, Profile } from '@linode/api-v4';

describe('entityPermissionMapFrom', () => {
  const grants = {
    linode: [
      { id: 1, permissions: 'read_write' },
      { id: 2, permissions: 'read_only' },
    ],
    firewall: [
      { id: 10, permissions: 'read_write' },
      { id: 20, permissions: 'read_only' },
    ],
  } as Grants;

  const profile = { restricted: true } as Profile;

  it('should map linode grants to permission maps', () => {
    const result = entityPermissionMapFrom(grants, 'linode', profile);
    expect(result[1].apply_linode_firewalls).toEqual(true);
    expect(result[1].clone_linode).toEqual(true);
    expect(result[1].reboot_linode).toEqual(true);
    expect(result[2].apply_linode_firewalls).toEqual(false);
    expect(result[2].clone_linode).toEqual(false);
    expect(result[2].reboot_linode).toEqual(false);
  });

  it('should map linode grants to permission maps for an unrestricted users', () => {
    const result = entityPermissionMapFrom(grants, 'linode', {
      restricted: false,
    } as Profile);
    expect(result[1].apply_linode_firewalls).toEqual(true);
    expect(result[1].clone_linode).toEqual(true);
    expect(result[1].reboot_linode).toEqual(true);
    expect(result[2].apply_linode_firewalls).toEqual(true);
    expect(result[2].clone_linode).toEqual(true);
    expect(result[2].reboot_linode).toEqual(true);
  });

  it('should return empty map if no grants for type', () => {
    const result = entityPermissionMapFrom({} as Grants, 'linode', profile);
    expect(result).toEqual({});
  });

  it('should return empty map if grants is undefined', () => {
    const result = entityPermissionMapFrom(undefined, 'linode', profile);
    expect(result).toEqual({});
  });
});

describe('toEntityPermissionMap', () => {
  const entities = [
    { id: 1, label: 'entity-1' },
    { id: 2, label: 'entity-2' },
  ];
  const permissionsToCheck: PermissionType[] = [
    'apply_linode_firewalls',
    'clone_linode',
    'reboot_linode',
  ];

  it('should map permissions for each entity correctly', () => {
    const entitiesPermissions = [
      ['apply_linode_firewalls', 'clone_linode'], // entity 1
      ['view_linode'], // entity 2
    ] as PermissionType[][];
    const result = toEntityPermissionMap(
      entities,
      entitiesPermissions,
      permissionsToCheck
    );
    expect(result).toEqual({
      1: {
        apply_linode_firewalls: true,
        clone_linode: true,
        reboot_linode: false,
      },
      2: {
        apply_linode_firewalls: false,
        clone_linode: false,
        reboot_linode: false,
      },
    });
  });

  it('should return an empty map if entities or permissions are undefined', () => {
    expect(
      toEntityPermissionMap(undefined, undefined, permissionsToCheck)
    ).toEqual({});
    expect(toEntityPermissionMap([], [], permissionsToCheck)).toEqual({});
  });

  it('should respect isRestricted=false (unrestricted user)', () => {
    const entitiesPermissions = [[], []];
    const result = toEntityPermissionMap(
      entities,
      entitiesPermissions,
      permissionsToCheck,
      false
    );
    expect(result).toEqual({
      1: {
        apply_linode_firewalls: true,
        clone_linode: true,
        reboot_linode: true,
      },
      2: {
        apply_linode_firewalls: true,
        clone_linode: true,
        reboot_linode: true,
      },
    });
  });
});

describe('toPermissionMap', () => {
  it('should map AccountAdmin permissions correctly', () => {
    const permissionsToCheck: PermissionType[] = [
      'cancel_account',
      'create_user',
      'update_account',
      'view_account',
    ];
    const usersPermissions: PermissionType[] = [
      'cancel_account',
      'create_user',
      'view_account',
    ];
    const result = toPermissionMap(permissionsToCheck, usersPermissions);
    expect(result).toEqual({
      cancel_account: true,
      create_user: true,
      update_account: false,
      view_account: true,
    });
  });

  it('should map LinodeContributor permissions correctly', () => {
    const permissionsToCheck: PermissionType[] = [
      'boot_linode',
      'apply_linode_firewalls',
      'resize_linode',
    ];
    const usersPermissions: PermissionType[] = ['boot_linode', 'resize_linode'];
    const result = toPermissionMap(permissionsToCheck, usersPermissions);
    expect(result).toEqual({
      boot_linode: true,
      apply_linode_firewalls: false,
      resize_linode: true,
    });
  });
});

describe('fromGrants', () => {
  const grants: Grants = {
    global: {
      account_access: null,
      add_databases: false,
      add_domains: false,
      add_firewalls: false,
      add_images: false,
      add_kubernetes: false,
      add_linodes: true,
      add_lkes: false,
      add_longview: false,
      add_nodebalancers: false,
      add_stackscripts: false,
      add_volumes: true,
      add_vpcs: false,
      cancel_account: false,
      child_account_access: null,
      longview_subscription: false,
    },
    linode: [
      {
        id: 99487769,
        label: 'corya-read_write-linode',
        permissions: 'read_write',
      },
      {
        id: 99496487,
        label: 'corya-read_only-linode',
        permissions: 'read_only',
      },
    ],
    firewall: [
      {
        id: 126860,
        label: 'corya-read_write-firewall',
        permissions: 'read_write',
      },
      {
        id: 129617,
        label: 'corya-read_only-firewall',
        permissions: 'read_only',
      },
    ],
    volume: [
      {
        id: 47145,
        label: 'corya-read_write-volume',
        permissions: 'read_write',
      },
      {
        id: 47846,
        label: 'corya-read_only-volume',
        permissions: 'read_only',
      },
    ],
    nodebalancer: [],
    domain: [],
    stackscript: [],
    longview: [],
    image: [],
    database: [],
    vpc: [],
    lkecluster: [],
  };

  it('should check account level permissions', () => {
    const permissionsToCheck: PermissionType[] = [
      'cancel_account',
      'update_account',
      'create_linode',
      'create_firewall',
    ];
    const result = fromGrants('account', permissionsToCheck, grants);
    expect(result).toEqual({
      cancel_account: false,
      update_account: false,
      create_linode: true,
      create_firewall: false,
    });
  });

  it('should check firewall permissions for read_write firewall', () => {
    const permissionsToCheck: PermissionType[] = [
      'update_firewall',
      'update_firewall_rules',
    ];
    const result = fromGrants(
      'firewall',
      permissionsToCheck,
      grants,
      false,
      126860
    );
    expect(result).toEqual({
      update_firewall: true,
      update_firewall_rules: true,
    });
  });

  it('should check linode permissions for read_write linode', () => {
    const permissionsToCheck: PermissionType[] = [
      'clone_linode',
      'reboot_linode',
      'update_linode',
      'upgrade_linode',
    ];
    const result = fromGrants(
      'linode',
      permissionsToCheck,
      grants,
      false,
      99487769
    );
    expect(result).toEqual({
      clone_linode: true,
      reboot_linode: true,
      update_linode: true,
      upgrade_linode: true,
    });
  });
});
