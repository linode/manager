import { getIsLegacyInterfaceArray } from 'src/features/Linodes/LinodeCreate/utilities';

import { escapeStringForCLI } from '../escapeStringForCLI';

import type { CreateLinodeRequest } from '@linode/api-v4';

// @TODO Linode Interfaces - need to handle case if interface is not legacy

/**
 * Generates a Terraform config to setup a Linode instance.
 * @param {Object} config - The configuration object for the Linode instance.
 * @returns {string} - Bash commands to write a Terraform config.
 */
export function generateTerraformConfig(config: CreateLinodeRequest): string {
  let terraformConfig = `resource "linode_instance" "web" {\n`;

  if (config.label) {
    terraformConfig += `  label = "${escapeStringForCLI(config.label)}"\n`;
  }
  if (config.image) {
    terraformConfig += `  image = "${escapeStringForCLI(config.image)}"\n`;
  }
  if (config.region) {
    terraformConfig += `  region = "${escapeStringForCLI(config.region)}"\n`;
  }
  if (config.type) {
    terraformConfig += `  type = "${escapeStringForCLI(config.type)}"\n`;
  }
  if (config.firewall_id) {
    terraformConfig += `  firewall_id = ${config.firewall_id}\n`;
  }

  if (config.placement_group && config.placement_group.id) {
    terraformConfig += `  placement_group {\n    id = ${config.placement_group.id}\n  }\n`;
  }

  if (config.metadata && config.metadata.user_data) {
    terraformConfig += `  metadata {\n    user_data = "${config.metadata.user_data}"\n  }\n`;
  }

  if (
    config.interfaces &&
    config.interfaces.length > 0 &&
    getIsLegacyInterfaceArray(config.interfaces)
  ) {
    config.interfaces.forEach((interfaceConfig) => {
      terraformConfig += `  interface {\n    purpose = "${interfaceConfig.purpose}"\n`;
      if (interfaceConfig.subnet_id) {
        terraformConfig += `    subnet_id = ${interfaceConfig.subnet_id}\n`;
      }
      if (interfaceConfig.ip_ranges && interfaceConfig.ip_ranges.length > 0) {
        const ip_rangesFormatted = interfaceConfig.ip_ranges
          ?.map((ip_range) => `"${ip_range}"`)
          ?.join(', ');
        terraformConfig += `    ip_ranges = [${ip_rangesFormatted}]\n`;
      }
      if (interfaceConfig.ipv4?.nat_1_1 || interfaceConfig.ipv4?.vpc) {
        terraformConfig += `    ipv4 {\n`;
        if (interfaceConfig.ipv4.nat_1_1) {
          terraformConfig += `      nat_1_1 = "${interfaceConfig.ipv4.nat_1_1}"\n`;
        }
        if (interfaceConfig.ipv4.vpc) {
          terraformConfig += `      vpc = "${interfaceConfig.ipv4.vpc}"\n`;
        }
        terraformConfig += `    }\n`;
      }
      if (interfaceConfig.label) {
        terraformConfig += `    label = "${interfaceConfig.label}"\n`;
      }
      if (interfaceConfig.ipam_address) {
        terraformConfig += `    ipam_address = "${interfaceConfig.ipam_address}"\n`;
      }
      terraformConfig += `  }\n`;
    });
  }
  if (config.authorized_users && config.authorized_users.length > 0) {
    const authorizedUsersFormatted = config.authorized_users
      ?.map((key) => `"${escapeStringForCLI(key)}"`)
      ?.join(', ');
    terraformConfig += `  authorized_users = [${authorizedUsersFormatted}]\n`;
  }

  if (config.authorized_keys && config.authorized_keys.length > 0) {
    const authorizedKeysFormatted = config.authorized_keys
      ?.map((user) => `"${escapeStringForCLI(user)}"`)
      ?.join(', ');
    terraformConfig += `  authorized_keys = [${authorizedKeysFormatted}]\n`;
  }
  if (config.root_pass) {
    terraformConfig += `  root_pass = "${escapeStringForCLI(
      config.root_pass
    )}"\n`;
  }
  if (config.tags && config.tags.length > 0) {
    const tagsFormatted = config.tags
      ?.map((tag) => `"${escapeStringForCLI(tag)}"`)
      ?.join(', ');
    terraformConfig += `  tags = [${tagsFormatted}]\n`;
  }
  if (config.swap_size) {
    terraformConfig += `  swap_size = ${config.swap_size}\n`;
  }
  if (config.hasOwnProperty('private_ip')) {
    // Checks explicitly for property existence
    terraformConfig += `  private_ip = ${config.private_ip}\n`;
  }
  if (config.backups_enabled) {
    terraformConfig += `  backups_enabled = ${config.backups_enabled}\n`;
  }

  terraformConfig += `}`;

  return terraformConfig;
}
