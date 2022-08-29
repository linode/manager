import { Grant } from '@linode/api-v4/lib/account';
import { getStackScripts, StackScript } from '@linode/api-v4/lib/stackscripts';
import { ResourcePage } from '@linode/api-v4/lib/types';
import { StackScriptsRequest } from './types';

export type StackScriptCategory = 'account' | 'community';

export const emptyResult: ResourcePage<StackScript> = {
  data: [],
  page: 1,
  pages: 1,
  results: 0,
};

/**
 * We need a way to make sure that newly added SS that meet
 * our filtering criteria don't automatically end up being
 * shown to the user before we've updated Cloud to support them.
 */
export const baseApps = {
  '401699': 'Ark - Latest One-Click',
  '401704': 'TF2 - Latest One-Click',
  '401705': 'Terraria - Latest One-Click',
  '401703': 'Rust - Latest One-Click',
  '401700': 'CS:GO - Latest One-Click',
  '401702': 'MERN One-Click',
  '401698': 'Drupal - Latest One-Click',
  '401707': 'GitLab - Latest One-Click',
  '401708': 'WooCommerce - Latest One-Click',
  '401706': 'WireGuard - Latest One-Click',
  '401709': 'Minecraft - Latest One-Click',
  '401701': 'LAMP One-Click',
  '401719': 'OpenVPN - Latest One-Click',
  '401697': 'WordPress - Latest One-Click',
  '595742': 'cPanel One-Click',
  '593835': 'Plesk One-Click',
  '604068': 'Shadowsocks - Latest One-Click',
  '606691': 'LEMP - Latest One-Click',
  '607026': 'MySQL - Latest One-Click',
  '607034': 'Prometheus - Latest One-Click',
  '607256': 'Grafana - Latest One-Click',
  '607401': 'Jenkins - Latest One-Click',
  '607433': 'Docker - Latest One-Click',
  '607488': 'Redis One-Click',
  '609048': 'Ruby on Rails One-Click',
  '609175': 'Django One-Click',
  '609195': 'MongoDB One-Click',
  '609392': 'Flask One-Click',
  '611376': 'PostgreSQL One-Click',
  '611895': 'MEAN One-Click',
  '688912': 'Kepler Builder One-Click',
  '609018': 'phpMYAdmin',
  '632758': 'Nextcloud',
  '644908': 'Percona',
  '662116': 'Webmin',
  '662117': 'Virtualmin',
  '662118': 'Azuracast',
  '662119': 'Plex',
  '662121': 'Jitsi',
  '688890': 'RabbitMQ',
  '688891': 'Discourse',
  '688902': 'Webuzo',
  '688903': 'Code Server',
  '688911': 'Gitea',
  '688914': 'Guacamole',
  '691614': 'Mist',
  '691620': 'FileCloud',
  '691621': 'Cloudron',
  '691622': 'OpenLiteSpeed',
  '692092': 'Secure Your Server',
  '741206': 'CyberPanel',
  '741207': 'Yacht',
  '741208': 'Zabbix',
  '774829': 'ServerWand',
  '781317': 'Valheim',
  '804143': 'Peppermint',
  '804144': 'Ant Media Server',
  '804172': 'Owncast',
  '869127': 'Moodle',
  '869129': 'aaPanel',
  '869153': 'Splunk',
  '869155': 'Chevereto',
  '869156': 'NirvaShare',
  '869158': 'ClusterControl',
  '869159': 'MagicSpam',
  '869623': 'JetBackup',
  '913277': 'BeEF',
  '923034': 'BitNinja',
  '912262': 'Harbor',
  '923032': 'LiteSpeed cPanel',
  '923029': 'OpenLiteSpeed Django',
  '923031': 'OpenLiteSpeed NodeJS',
  '923030': 'OpenLiteSpeed Rails',
  '925722': 'Pritunl',
  '912264': 'Rocket.Chat',
  '925530': 'UTunnel VPN',
  '923037': 'WarpSpeed',
  '913276': 'Wazuh',
  '923033': 'Akaunting',
  '923036': 'Restyaboard',
  '954759': 'VictoriaMetrics',
  '970522': 'Pi-hole',
  '970523': 'Uptime Kuma',
  '971042': 'Saltcorn',
  '971045': 'Focalboard',
  '971043': 'Odoo',
  '970559': 'Grav',
  '970561': 'NodeJS',
  '985372': 'Joomla',
  '985380': 'Joplin',
  '985364': 'Prometheus & Grafana',
  '985374': 'Ant Media Enterprise Edition',
  '1008123': 'Liveswitch',
  '1008125': 'Easypanel',
  '1017300': 'Kali Linux',
  '1037036': 'Budibase',
  '1037037': 'HashiCorp Nomad',
  '1037038': 'HashiCorp Vault',
};

const oneClickFilter = [
  {
    '+and': [
      { '+or': [{ username: 'linode-stackscripts' }, { username: 'linode' }] },
      {
        label: {
          '+contains': 'One-Click',
        },
      },
    ],
  },
  { '+order_by': 'ordinal' },
];

export const getOneClickApps = (params?: any) =>
  getStackScripts(params, oneClickFilter);

export const getStackScriptsByUser: StackScriptsRequest = (
  username: string,
  params?: any,
  filter?: any
) =>
  getStackScripts(params, {
    ...filter,
    username,
  });

export const getMineAndAccountStackScripts: StackScriptsRequest = (
  params?: any,
  filter?: any
) => {
  return getStackScripts(params, { ...filter, mine: true });
};

/**
 * Gets all StackScripts that don't belong to user "Linode"
 * and do not belong to any users on the current account
 */
export const getCommunityStackscripts: StackScriptsRequest = (
  params?: any,
  filter?: any
) => {
  return getStackScripts(params, {
    ...filter,
    mine: false,
    '+and': [
      { username: { '+neq': 'linode' } },
      // linode-stackscripts is the account name on dev for Marketplace Apps
      { username: { '+neq': 'linode-stackscripts' } },
    ],
  });
};

export type AcceptedFilters = 'username' | 'description' | 'label';

export const generateSpecificFilter = (
  key: AcceptedFilters,
  searchTerm: string
) => {
  return {
    [key]: {
      ['+contains']: searchTerm,
    },
  };
};

export const generateCatchAllFilter = (searchTerm: string) => {
  return {
    ['+or']: [
      {
        label: {
          ['+contains']: searchTerm,
        },
      },
      {
        username: {
          ['+contains']: searchTerm,
        },
      },
      {
        description: {
          ['+contains']: searchTerm,
        },
      },
    ],
  };
};

export const getStackScriptUrl = (
  username: string,
  id: number,
  currentUser?: string
) => {
  let type;
  let subtype;
  switch (username) {
    case 'linode':
      // This is a Marketplace App
      type = 'One-Click';
      subtype = 'One-Click%20Apps';
      break;
    case currentUser:
      // My StackScripts
      // @todo: handle account stackscripts
      type = 'StackScripts';
      subtype = 'Account';
      break;
    default:
      // Community StackScripts
      type = 'StackScripts';
      subtype = 'Community';
  }
  return `/linodes/create?type=${type}&subtype=${subtype}&stackScriptID=${id}`;
};

export const canUserModifyAccountStackScript = (
  isRestrictedUser: boolean,
  stackScriptGrants: Grant[],
  stackScriptID: number
) => {
  // If the user isn't restricted, they can modify any StackScript on the account
  if (!isRestrictedUser) {
    return true;
  }

  // Look for permissions for this specific StackScript
  const grantsForThisStackScript = stackScriptGrants.find(
    (eachGrant: Grant) => eachGrant.id === Number(stackScriptID)
  );

  // If there are no permissions for this StackScript (permissions:"none")
  if (!grantsForThisStackScript) {
    return false;
  }

  // User must have "read_write" permissions to modify StackScript
  return grantsForThisStackScript.permissions === 'read_write';
};
