import { getIsLegacyInterfaceArray } from '@linode/utilities';

import type { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';

// @TODO Linode Interfaces - need to handle case if interface is not legacy

/**
 * Escapes special characters in a string for use in Python strings.
 * @param {string} str - The string to escape.
 * @returns {string} - The safely escaped string.
 */
function escapePythonString(value: string): string {
  return value.replace(/(["\\])/g, '\\$1');
}

/**
 * Generates a Python code snippet for creating a Linode instance using the Linode API.
 * @param {Object} config - Configuration details for the Linode instance.
 * @returns {string} - Python code as a string.
 */
export function generatePythonLinodeSnippet(
  config: CreateLinodeRequest
): string {
  let snippet = "client = LinodeClient(token=os.getenv('LINODE_TOKEN'))\n";
  snippet += 'new_linode = client.linode.instance_create(\n';

  // Required fields
  snippet += `    ltype="${escapePythonString(config.type)}",\n`;
  snippet += `    region="${escapePythonString(config.region)}",\n`;

  // Optional fields
  if (config.image) {
    snippet += `    image="${escapePythonString(config.image)}",\n`;
  }
  if (config.label) {
    snippet += `    label="${escapePythonString(config.label)}",\n`;
  }
  if (config.root_pass) {
    snippet += `    root_pass="${escapePythonString(config.root_pass)}",\n`;
  }
  if (config.placement_group && config.placement_group.id) {
    snippet += `    placement_group={\n        "id" : ${config.placement_group.id},\n    },\n`;
  }
  if (config.metadata && config.metadata.user_data) {
    snippet += `    metadata={\n        "user_data" : "${config.metadata.user_data}",\n    },\n`;
  }
  if (config.authorized_users && config.authorized_users.length > 0) {
    const users = config.authorized_users
      .map((user) => `"${escapePythonString(user)}"`)
      .join(', ');
    snippet += `    authorized_users=[${users}],\n`;
  }
  // Handling other optional fields like authorized_keys, stackscript_id, etc.
  if (config.authorized_keys && config.authorized_keys.length > 0) {
    const keys = config.authorized_keys
      .map((key) => `"${escapePythonString(key)}"`)
      .join(', ');
    snippet += `    authorized_keys=[${keys}],\n`;
  }
  // Handling interfaces
  if (
    config.interfaces &&
    config.interfaces.length > 0 &&
    getIsLegacyInterfaceArray(config.interfaces)
  ) {
    snippet += '    interfaces=[\n';
    config.interfaces.forEach((iface) => {
      snippet += `        {\n`;
      if (iface.label) {
        snippet += `            "label": "${escapePythonString(
          iface.label
        )}",\n`;
      }
      if (iface.ipv4 && (iface.ipv4?.nat_1_1 || iface.ipv4?.vpc)) {
        snippet += `            "ipv4": {\n`;
        if (iface.ipv4?.nat_1_1) {
          snippet += `                "nat_1_1": "${iface.ipv4.nat_1_1}",\n`;
        }
        if (iface.ipv4?.vpc) {
          snippet += `                "vpc": "${iface.ipv4.vpc}",\n`;
        }
        snippet += `            },\n`;
      }
      if (iface.purpose) {
        snippet += `            "purpose": "${escapePythonString(
          iface.purpose
        )}",\n`;
      }
      if (iface.ipam_address) {
        snippet += `            "ipam_address": "${escapePythonString(
          iface.ipam_address
        )}",\n`;
      }
      if (iface.subnet_id) {
        snippet += `            "subnet_id": ${iface.subnet_id},\n`;
      }
      if (iface.ip_ranges && iface.ip_ranges.length > 0) {
        const ipRanges = iface.ip_ranges
          .map((range) => `"${escapePythonString(range)}"`)
          .join(', ');
        snippet += `            "ip_ranges": [${ipRanges}],\n`;
      }
      snippet += '        },\n';
    });
    snippet += '    ],\n';
  }
  if (config.backups_enabled) {
    snippet += `    backups_enabled=True,\n`;
  }
  if (config.firewall_id) {
    snippet += `    firewall_id=${config.firewall_id},\n`;
  }
  if (config.stackscript_id) {
    snippet += `    stackscript_id=${config.stackscript_id},\n`;
  }
  if (config.tags && config.tags.length > 0) {
    const tags = config.tags
      .map((tag) => `"${escapePythonString(tag)}"`)
      .join(', ');
    snippet += `    tags=[${tags}],\n`;
  }
  if (config.private_ip) {
    snippet += `    private_ip=True,\n`;
  }
  // Trim the last comma if any optional fields were added
  if (snippet[snippet.length - 2] === ',') {
    snippet = snippet.slice(0, -2) + '\n';
  }

  snippet += ')';
  return snippet;
}
