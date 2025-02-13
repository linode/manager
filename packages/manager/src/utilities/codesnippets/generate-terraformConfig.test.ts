import { generateTerraformConfig } from './generate-terraformConfig';

import type { CreateLinodeRequest } from '@linode/api-v4';

describe('generateTerraformConfig', () => {
  it('should generate correct configuration with all properties', () => {
    const config: CreateLinodeRequest = {
      authorized_keys: ['ssh-rsa AAA...'],
      authorized_users: ['user123'],
      backup_id: 67890,
      firewall_id: 98765,
      image: 'linode/ubuntu20.04',
      interfaces: [
        {
          ip_ranges: ['192.168.1.1/32'],
          ipam_address: '192.0.0.0/24',
          ipv4: {
            nat_1_1: '192.168.1.100',
            vpc: '192.168.2.0',
          },
          label: 'interface-label',
          purpose: 'public',
        },
        {
          ipam_address: '192.0.0.0/24',
          label: 'test',
          purpose: 'vlan',
        },
      ],
      label: 'my-instance',
      metadata: {
        user_data: 'echo Hello World',
      },
      private_ip: true,
      region: 'us-east',
      root_pass: 'verySecurePass123',
      stackscript_id: 12345,
      swap_size: 512,
      tags: ['production', 'web'],
      type: 'g6-nanode-1',
    };

    const expectedOutput =
      `resource "linode_instance" "web" {\n` +
      `  label = "my-instance"\n` +
      `  image = "linode/ubuntu20.04"\n` +
      `  region = "us-east"\n` +
      `  type = "g6-nanode-1"\n` +
      `  firewall_id = 98765\n` +
      `  metadata {\n` +
      `    user_data = "echo Hello World"\n` +
      `  }\n` +
      `  interface {\n` +
      `    purpose = "public"\n` +
      `    ip_ranges = ["192.168.1.1/32"]\n` +
      `    ipv4 {\n` +
      `      nat_1_1 = "192.168.1.100"\n` +
      `      vpc = "192.168.2.0"\n` +
      `    }\n` +
      `    label = "interface-label"\n` +
      `    ipam_address = "192.0.0.0/24"\n` +
      `  }\n` +
      `  interface {\n` +
      `    purpose = "vlan"\n` +
      `    label = "test"\n` +
      `    ipam_address = "192.0.0.0/24"\n` +
      `  }\n` +
      `  authorized_users = ["user123"]\n` +
      `  authorized_keys = ["ssh-rsa AAA..."]\n` +
      `  root_pass = "verySecurePass123"\n` +
      `  tags = ["production", "web"]\n` +
      `  swap_size = 512\n` +
      `  private_ip = true\n` +
      `}`;

    expect(generateTerraformConfig(config)).toEqual(expectedOutput);
  });

  it('should handle optional properties gracefully', () => {
    const config = {
      image: 'linode/ubuntu18.04',
      region: 'us-west',
      type: 'g6-standard-2',
    };

    const expectedOutput =
      `resource "linode_instance" "web" {\n` +
      `  image = "linode/ubuntu18.04"\n` +
      `  region = "us-west"\n` +
      `  type = "g6-standard-2"\n` +
      `}`;

    expect(generateTerraformConfig(config)).toEqual(expectedOutput);
  });

  it('should escape special characters in strings', () => {
    const config = {
      label: 'test"instance"',
      region: 'us-west',
      root_pass: 'pass"word',
      type: 'g6-standard-2',
    };

    const expectedOutput =
      `resource "linode_instance" "web" {\n` +
      `  label = "test\\"instance\\""\n` +
      `  region = "us-west"\n` +
      `  type = "g6-standard-2"\n` +
      `  root_pass = "pass\\"word"\n` +
      `}`;

    expect(generateTerraformConfig(config)).toEqual(expectedOutput);
  });
});
