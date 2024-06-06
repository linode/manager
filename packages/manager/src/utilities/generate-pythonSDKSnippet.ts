import { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';

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
  snippet += 'new_linode, root_pass = client.linode.instance_create(\n';

  // Required fields
  snippet += `    type="${escapePythonString(config.type)}",\n`;
  snippet += `    region="${escapePythonString(config.region)}",\n`;

  // Optional fields
  if (config.image) {
    snippet += `    image="${escapePythonString(config.image)}",\n`;
  }
  if (config.label) {
    snippet += `    label="${escapePythonString(config.label)}",\n`;
  }
  // Handling other optional fields like authorized_keys, stackscript_id, etc.
  if (config.authorized_keys && config.authorized_keys.length > 0) {
    const keys = config.authorized_keys
      .map((key) => `"${escapePythonString(key)}"`)
      .join(', ');
    snippet += `    authorized_keys=[${keys}],\n`;
  }
  if (config.backups_enabled) {
    snippet += `    backups_enabled=${config.backups_enabled},\n`;
  }
  // Trim the last comma if any optional fields were added
  if (snippet[snippet.length - 2] === ',') {
    snippet = snippet.slice(0, -2) + '\n';
  }

  snippet += ')\n';
  return snippet;
}
