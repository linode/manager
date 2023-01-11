import generateCurlCommand, { generateCLICommand } from './generate-cURL';

const linodeData = {
  label: 'linode-1',
  root_pass: 'aComplex@Password',
  region: 'us-east',
  type: 'g6-standard-2',
};

const linodeDataForCLI = `
--label linode-1
--root_pass aComplex@Password
--region us-east
--type g6-standard-2
`
  .trimStart()
  .trimEnd();

const linodeDataString = JSON.stringify(linodeData);

describe('generateCurlCommand', () => {
  it('should return a string that starts with curl', () => {
    const generatedCommand = generateCurlCommand(linodeDataString);
    expect(generatedCommand.slice(0, 4)).toBe('curl');
  });

  it('should produce a curl command that targets the linode API', () => {
    const generatedCommand = generateCurlCommand(linodeDataString);
    expect(generatedCommand).toMatch('https://api.linode.com/v4/');
  });

  it('should return a curl command that has a Content-Type header set to application/json', () => {
    const generatedCommand = generateCurlCommand(linodeDataString);
    expect(generatedCommand).toMatch('-H "Content-Type: application/json"');
  });

  it('should return a curl command that has an Authorization header set to Bearer $TOKEN', () => {
    const generatedCommand = generateCurlCommand(linodeDataString);
    expect(generatedCommand).toMatch('-H "Authorization: Bearer $TOKEN"');
  });

  it('should return a curl command that has an HTTP method set', () => {
    const generatedCommand = generateCurlCommand(linodeDataString);
    expect(generatedCommand).toMatch(/-X (POST)/);
  });

  it('should return a curl command that has a data option set', () => {
    const generatedCommand = generateCurlCommand(linodeDataString);
    expect(generatedCommand).toMatch('-d');
  });

  it('should return a curl command that has a data option set to the argument passed to it', () => {
    const generatedCommand = generateCurlCommand(linodeData);
    expect(generatedCommand).toMatch(`-d ${linodeDataString}`);
  });
});

describe('generateCLICommand', () => {
  it('should return a linode-cli command', () => {
    const generatedCommand = generateCLICommand(linodeData);
    expect(generatedCommand.startsWith('linode-cli')).toBeTruthy();
  });

  it('should return a linode-cli linodes create command', () => {
    const generatedCommand = generateCLICommand(linodeData);
    expect(
      generatedCommand.startsWith('linode-cli linodes create')
    ).toBeTruthy();
  });

  it('should return a linode-cli command with the data provided formatted as arguments', () => {
    const generatedCommand = generateCLICommand(linodeData);
    expect(generatedCommand).toMatch(linodeDataForCLI);
  });
});
