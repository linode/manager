import { getIsLegacyInterfaceArray } from 'src/features/Linodes/LinodeCreate/utilities';

import type { CreateLinodeRequest } from '@linode/api-v4';

// @TODO Linode Interfaces - need to handle case if interface is not legacy

/**
 * Escapes special characters in a string for use in YAML and shell commands.
 * @param {string} str - The string to escape.
 * @returns {string} - The safely escaped string.
 */
function escapeYAMLString(str: string) {
  return str.replace(/(["':\\\[\\\]\\\{\\\}])/g, '\\$1').replace(/\n/g, '\\n');
}

/**
 * Generates an Ansible configuration for a Linode instance.
 * @param {Object} config - Configuration details for the instance.
 * @returns {string} - The Ansible config as a string.
 */
export function generateAnsibleConfig(config: CreateLinodeRequest): string {
  let configStr = `- name: Create a new Linode instance.\n  linode.cloud.instance:\n`;

  configStr += `    state: "present"\n`;

  if (config.label) {
    configStr += `    label: "${escapeYAMLString(config.label)}"\n`;
  }
  if (config.type) {
    configStr += `    type: "${escapeYAMLString(config.type)}"\n`;
  }
  if (config.region) {
    configStr += `    region: "${escapeYAMLString(config.region)}"\n`;
  }
  if (config.image) {
    configStr += `    image: "${escapeYAMLString(config.image)}"\n`;
  }
  if (config.root_pass) {
    configStr += `    root_pass: "${escapeYAMLString(config.root_pass)}"\n`;
  }
  if (config.metadata) {
    configStr += `    metadata:\n      user_data: "${config.metadata?.user_data}"\n`;
  }
  if (config.hasOwnProperty('private_ip')) {
    configStr += `    private_ip: ${config.private_ip}\n`;
  }
  if (config.authorized_users && config.authorized_users.length > 0) {
    configStr += `    authorized_users:\n      - "${config.authorized_users
      .map((user) => escapeYAMLString(user))
      .join('"\n      - "')}"\n`;
  }
  if (config.authorized_keys && config.authorized_keys.length > 0) {
    configStr += `    authorized_keys:\n      - "${config.authorized_keys
      .map((key) => escapeYAMLString(key))
      .join('"\n      - "')}"\n`;
  }
  if (config.firewall_id) {
    configStr += `    firewall_id: ${config.firewall_id}\n`;
  }
  if (config.stackscript_id) {
    configStr += `    stackscript_id: ${config.stackscript_id}\n`;
  }
  if (config.stackscript_data) {
    configStr += `    stackscript_data:\n`;
    Object.keys(config.stackscript_data).forEach((key) => {
      configStr += `      ${key}: "${escapeYAMLString(
        config.stackscript_data[key]
      )}"\n`;
    });
  }
  if (config.backups_enabled) {
    configStr += `    backups_enabled: ${config.backups_enabled}\n`;
  }
  if (config.placement_group) {
    configStr += `    placement_group:\n      id: ${config.placement_group?.id}\n`;
  }
  if (config.tags && config.tags.length > 0) {
    configStr += `    tags:\n      - "${config.tags
      .map((tag) => escapeYAMLString(tag))
      .join('"\n      - "')}"\n`;
  }
  if (
    config.interfaces &&
    config.interfaces.length > 0 &&
    getIsLegacyInterfaceArray(config.interfaces)
  ) {
    configStr += `    interfaces:\n`;
    config.interfaces.forEach((iface) => {
      configStr += `      - purpose: "${escapeYAMLString(iface.purpose)}"\n`;
      if (iface.subnet_id) {
        configStr += `        subnet_id: ${iface.subnet_id}\n`;
      }
      if (iface.ip_ranges && iface.ip_ranges.length > 0) {
        configStr += `        ip_ranges:\n          - ${iface.ip_ranges
          .map((ip) => `"${escapeYAMLString(ip)}"`)
          .join('\n          - ')}\n`;
      }
      if (iface.ipv4 && (iface.ipv4?.nat_1_1 || iface.ipv4?.vpc)) {
        configStr += `        ipv4:\n`;
        if (iface.ipv4.nat_1_1) {
          configStr += `          nat_1_1: "${iface.ipv4.nat_1_1}"\n`;
        }
        if (iface.ipv4.vpc) {
          configStr += `          vpc: "${iface.ipv4.vpc}"\n`;
        }
      }
      if (iface.label) {
        configStr += `        label: "${escapeYAMLString(iface.label)}"\n`;
      }
      if (iface.ipam_address) {
        configStr += `        ipam_address: "${escapeYAMLString(
          iface.ipam_address
        )}"\n`;
      }
    });
  }

  return configStr.trim();
}
