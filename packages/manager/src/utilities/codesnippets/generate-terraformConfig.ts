import { escapeStringForCLI } from '../escapeStringForCLI';

import type { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';

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
  if (config.authorized_keys && config.authorized_keys.length > 0) {
    const authorizedKeysFormatted = config.authorized_keys
      ?.map((key) => `"${escapeStringForCLI(key)}"`)
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
  if (config.interfaces) {
    terraformConfig += `  interfaces = [\n`;
    config.interfaces.forEach((iface) => {
      terraformConfig += `    {\n`;
      terraformConfig += `      purpose = "${escapeStringForCLI(
        iface.purpose
      )}"\n`;
      if (iface.ip_ranges) {
        terraformConfig += `      ip_ranges = ${JSON.stringify(
          iface.ip_ranges.map((ip) => escapeStringForCLI(ip))
        )}\n`;
      }
      if (iface.subnet_id) {
        terraformConfig += `      subnet_id = ${iface.subnet_id}\n`;
      }
      terraformConfig += `    },\n`;
    });
    terraformConfig += `  ]\n`;
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

  terraformConfig += `}\n`;

  return terraformConfig;
}
