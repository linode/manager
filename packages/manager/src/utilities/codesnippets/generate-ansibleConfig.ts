import type { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';

/**
 * Escapes special characters in a string for use in YAML and shell commands.
 * @param {string} str - The string to escape.
 * @returns {string} - The safely escaped string.
 */
function escapeYAMLString(str: string) {
  return str.replace(/(["':\[\]\{\}])/g, '\\$1').replace(/\n/g, '\\n');
}

/**
 * Generates an Ansible configuration for a Linode instance.
 * @param {Object} config - Configuration details for the instance.
 * @returns {string} - The Ansible config as a string.
 */
export function generateAnsibleConfig(config: CreateLinodeRequest): string {
  let configStr = `- name: Create a new Linode instance.\n  linode.cloud.instance:\n`;

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
  if (config.hasOwnProperty('private_ip')) {
    configStr += `    private_ip: ${config.private_ip}\n`;
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
  if (config.tags && config.tags.length > 0) {
    configStr += `    tags:\n      - "${config.tags
      .map((tag) => escapeYAMLString(tag))
      .join('"\n      - "')}"\n`;
  }
  if (config.interfaces && config.interfaces.length > 0) {
    configStr += `    interfaces:\n`;
    config.interfaces.forEach((iface) => {
      configStr += `      - purpose: "${escapeYAMLString(iface.purpose)}"\n`;
      if (iface.subnet_id) {
        configStr += `        subnet_id: ${iface.subnet_id}\n`;
      }
      if (iface.ip_ranges) {
        configStr += `        ip_ranges:\n          - ${iface.ip_ranges
          .map((ip) => escapeYAMLString(ip))
          .join('\n          - ')}\n`;
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

  return configStr;
}
