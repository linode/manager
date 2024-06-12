import { generateGoLinodeSnippet } from './generate-goSDKSnippet';

describe('generateGoLinodeSnippet', () => {
  it('should generates the correct Go SDK snippet for creating a Linode instance', () => {
    const config = {
      label: 'TestInstance',
      region: 'us-central',
      root_pass: 'securePassword123',
      type: 'g6-nanode-1',
    };

    const expectedOutput = `linodeClient.CreateInstance(\n    context.Background(),\n    linodego.InstanceCreateOptions{\n        Type: "g6-nanode-1",\n        Region: "us-central",\n        Label: "TestInstance",\n        root_pass: "securePassword123",\n    },\n)\n`;

    expect(generateGoLinodeSnippet(config)).toEqual(expectedOutput);
  });

  it('should escape special characters in Go strings', () => {
    const config = {
      label: 'Test"Instance',
      region: 'us-"central',
      root_pass: 'secure"Password123',
      type: 'g6-"nanode-1',
    };

    const expectedOutput = `linodeClient.CreateInstance(\n    context.Background(),\n    linodego.InstanceCreateOptions{\n        Type: "g6-\\"nanode-1",\n        Region: "us-\\"central",\n        Label: "Test\\"Instance",\n        root_pass: "secure\\"Password123",\n    },\n)\n`;

    expect(generateGoLinodeSnippet(config)).toEqual(expectedOutput);
  });
});
