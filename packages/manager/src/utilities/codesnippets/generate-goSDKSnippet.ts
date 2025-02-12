import type { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';

/**
 * Escapes special characters in a string for use in Go strings.
 * @param {string} value - The string to escape.
 * @returns {string} - The escaped string.
 */
function escapeGoString(value: string): string {
  return value.replace(/(["\\])/g, '\\$1');
}

/**
 * Generates a Go code snippet using Linode Go SDK to create a Linode instance.
 * @param {CreateLinodeRequest} config - Configuration details for the instance.
 * @returns {string} - The Go code snippet.
 */
export function generateGoLinodeSnippet(config: CreateLinodeRequest): string {
  let snippet = 'linodeClient.CreateInstance(\n';
  snippet += '    context.Background(),\n';
  snippet += '    linodego.InstanceCreateOptions{\n';

  // Required fields
  snippet += `        Type: "${escapeGoString(config.type)}",\n`;
  snippet += `        Region: "${escapeGoString(config.region)}",\n`;

  // Optional fields
  if (config.label) {
    snippet += `        Label: "${escapeGoString(config.label)}",\n`;
  }
  if (config.image) {
    snippet += `        Image: "${escapeGoString(config.image)}",\n`;
  }
  if (config.root_pass) {
    snippet += `        RootPass: "${escapeGoString(config.root_pass)}",\n`;
  }
  if (config.authorized_keys) {
    const keys = config.authorized_keys
      .map((key) => `"${escapeGoString(key)}"`)
      .join(', ');
    snippet += `        AuthorizedKeys: []string{${keys}},\n`;
  }
  if (config.authorized_users) {
    const users = config.authorized_users
      .map((user) => `"${escapeGoString(user)}"`)
      .join(', ');
    snippet += `        AuthorizedUsers: []string{${users}},\n`;
  }
  if (config.swap_size) {
    snippet += `        SwapSize: ${config.swap_size},\n`;
  }
  if (config.backups_enabled) {
    snippet += `        BackupsEnabled: ${config.backups_enabled},\n`;
  }
  if (config.private_ip) {
    snippet += `        PrivateIP: ${config.private_ip},\n`;
  }
  if (config.tags && config.tags?.length > 0) {
    const tags = config.tags
      .map((tag) => `"${escapeGoString(tag)}"`)
      .join(', ');
    snippet += `        Tags: []string{${tags}},\n`;
  }

  if (config.stackscript_id) {
    snippet += `        StackScriptID: ${config.stackscript_id},\n`;
  }
  if (config.backup_id) {
    snippet += `        BackupID: ${config.backup_id},\n`;
  }
  if (config.firewall_id) {
    snippet += `        FirewallID: ${config.firewall_id},\n`;
  }
  // Add metadata if present
  if (config.metadata && config.metadata.user_data) {
    snippet += `        Metadata: &linodego.InstanceMetadataOptions{\n`;
    snippet += `            UserData: "${config.metadata.user_data}",\n`;
    snippet += `        },\n`;
  }

  snippet += '    },\n';
  snippet += ')';
  return snippet;
}
