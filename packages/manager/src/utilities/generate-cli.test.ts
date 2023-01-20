import generateCLICommand from './generate-cli';

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
