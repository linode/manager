import { generateTerraformConfig } from './generate-terraformConfig';

describe('generateTerraformConfig', () => {
  it('should generate correct configuration with all properties', () => {
    const config = {
      authorized_keys: ['ssh-rsa AAA...'],
      image: 'linode/ubuntu20.04',
      label: 'my-instance',
      private_ip: true,
      region: 'us-east',
      root_pass: 'securePass123',
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
      `  authorized_keys = ["ssh-rsa AAA..."]\n` +
      `  root_pass = "securePass123"\n` +
      `  tags = ["production", "web"]\n` +
      `  swap_size = 512\n` +
      `  private_ip = true\n` +
      `}\n`;

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
      `}\n`;

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
      `}\n`;

    expect(generateTerraformConfig(config)).toEqual(expectedOutput);
  });
});
