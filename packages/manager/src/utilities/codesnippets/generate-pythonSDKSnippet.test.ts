import { generatePythonLinodeSnippet } from './generate-pythonSDKSnippet';

describe('generatePythonLinodeSnippet', () => {
  it('should correctly generates Python snippet for creating a Linode instance', () => {
    const config = {
      image: 'linode/ubuntu20.04',
      label: 'MyTestLinode',
      region: 'us-central',
      type: 'g6-standard-1',
    };

    const expectedOutput = `client = LinodeClient(token=os.getenv(\'LINODE_TOKEN\'))\nnew_linode = client.linode.instance_create(\n    ltype="g6-standard-1",\n    region="us-central",\n    image="linode/ubuntu20.04",\n    label="MyTestLinode"\n)\n`;
    expect(generatePythonLinodeSnippet(config)).toEqual(expectedOutput);
  });

  it('should escapes special characters in Python strings gracefully', () => {
    const config = {
      image: 'linode/ubuntu20.04',
      label: 'Test"Instance',
      region: 'us-"central',
      type: 'g6-"nanode-1',
    };

    const expectedOutput = `client = LinodeClient(token=os.getenv(\'LINODE_TOKEN\'))\nnew_linode = client.linode.instance_create(\n    ltype="g6-\\"nanode-1",\n    region="us-\\"central",\n    image="linode/ubuntu20.04",\n    label="Test\\"Instance"\n)\n`;
    expect(generatePythonLinodeSnippet(config)).toEqual(expectedOutput);
  });
});
