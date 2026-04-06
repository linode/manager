import { generateGoLinodeSnippet } from './generate-goSDKSnippet';

describe('generateGoLinodeSnippet', () => {
  it('should generates the correct Go SDK snippet for creating a Linode instance', () => {
    const config = {
      label: 'TestInstance',
      region: 'us-central',
      root_pass: 'securePassword123',
      type: 'g6-nanode-1',
    };

    const expectedOutput = `linodeClient.CreateInstance(\n    context.Background(),\n    linodego.InstanceCreateOptions{\n        Type: "g6-nanode-1",\n        Region: "us-central",\n        Label: "TestInstance",\n        RootPass: "securePassword123",\n    },\n)`;

    expect(generateGoLinodeSnippet(config)).toEqual(expectedOutput);
  });

  it('should escape special characters in Go strings', () => {
    const config = {
      label: 'Test"Instance',
      region: 'us-"central',
      root_pass: 'secure"Password123',
      type: 'g6-"nanode-1',
    };

    const expectedOutput = `linodeClient.CreateInstance(\n    context.Background(),\n    linodego.InstanceCreateOptions{\n        Type: "g6-\\"nanode-1",\n        Region: "us-\\"central",\n        Label: "Test\\"Instance",\n        RootPass: "secure\\"Password123",\n    },\n)`;

    expect(generateGoLinodeSnippet(config)).toEqual(expectedOutput);
  });

  it('should include all optional fields in the snippet when provided', () => {
    const config = {
      authorized_keys: ['ssh AAA...'],
      authorized_users: ['user1'],
      backup_id: 23456,
      backups_enabled: true,
      firewall_id: 12345,
      image: 'linode/ubuntu20.04',
      label: 'TestInstance',
      metadata: { user_data: 'echo Hello World' },
      private_ip: true,
      region: 'us-east',
      root_pass: 'examplePassword',
      stackscript_id: 67890,
      swap_size: 512,
      tags: ['tag1', 'tag2'],
      type: 'g6-standard-1',
    };

    const expectedOutput = `linodeClient.CreateInstance(\n    context.Background(),\n    linodego.InstanceCreateOptions{\n        Type: "g6-standard-1",\n        Region: "us-east",\n        Label: "TestInstance",\n        Image: "linode/ubuntu20.04",\n        RootPass: "examplePassword",\n        AuthorizedKeys: []string{"ssh AAA..."},\n        AuthorizedUsers: []string{"user1"},\n        SwapSize: 512,\n        BackupsEnabled: true,\n        PrivateIP: true,\n        Tags: []string{"tag1", "tag2"},\n        StackScriptID: 67890,\n        BackupID: 23456,\n        FirewallID: 12345,\n        Metadata: &linodego.InstanceMetadataOptions{\n            UserData: "echo Hello World",\n        },\n    },\n)`;

    expect(generateGoLinodeSnippet(config)).toEqual(expectedOutput);
  });
});
