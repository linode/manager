import { generateAnsibleConfig } from './generate-ansibleConfig';

describe('generateAnsibleConfig', () => {
  it('should generate correct configuration with all properties', () => {
    const config = {
      image: 'linode/ubuntu20.04',
      label: 'Test Linode',
      private_ip: true,
      region: 'us-central',
      root_pass: 'securePass123',
      stackscript_data: { key1: 'value1', key2: 'value2' },
      stackscript_id: 12345,
      tags: ['production', 'webserver'],
      type: 'g6-standard-1',
    };

    const expectedOutput = `- name: Create a new Linode instance.\n  linode.cloud.instance:\n    state: "present"\n    label: "Test Linode"\n    type: "g6-standard-1"\n    region: "us-central"\n    image: "linode/ubuntu20.04"\n    root_pass: "securePass123"\n    private_ip: true\n    stackscript_id: 12345\n    stackscript_data:\n      key1: "value1"\n      key2: "value2"\n    tags:\n      - "production"\n      - "webserver"`;

    expect(generateAnsibleConfig(config)).toEqual(expectedOutput);
  });

  it('should handle optional properties correctly', () => {
    const config = {
      image: 'linode/ubuntu18.04',
      region: 'us-east',
      type: 'g6-nanode-1',
    };

    const expectedOutput = `- name: Create a new Linode instance.\n  linode.cloud.instance:\n    state: "present"\n    type: "g6-nanode-1"\n    region: "us-east"\n    image: "linode/ubuntu18.04"`;

    expect(generateAnsibleConfig(config)).toEqual(expectedOutput);
  });

  it('should escape special characters in YAML strings', () => {
    const config = {
      label: 'Linode with "quotes" and : colons',
      region: 'us-central',
      root_pass: 'securePass123',
      type: 'g6-standard-1',
    };

    const expectedOutput = `- name: Create a new Linode instance.\n  linode.cloud.instance:\n    state: "present"\n    label: "Linode with \\"quotes\\" and \\: colons"\n    type: "g6-standard-1"\n    region: "us-central"\n    root_pass: "securePass123"`;

    expect(generateAnsibleConfig(config)).toEqual(expectedOutput);
  });

  it('should safely escape extra backslash characters in YAML strings', () => {
    const config = {
      label: 'Linode with ] and also \\[, }, and \\{',
      region: 'us-central',
      root_pass: 'securePass123',
      type: 'g6-standard-1',
    };

    const expectedOutput = `- name: Create a new Linode instance.\n  linode.cloud.instance:\n    state: "present"\n    label: "Linode with \\] and also \\\\\\[, \\}, and \\\\\\{"\n    type: "g6-standard-1"\n    region: "us-central"\n    root_pass: "securePass123"`;

    expect(generateAnsibleConfig(config)).toEqual(expectedOutput);
  });
});
