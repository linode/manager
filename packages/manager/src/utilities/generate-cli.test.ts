import generateCLICommand from './generate-cli';
import { createLinodeRequestFactory } from 'src/factories/linodes';

const linodeRequest = createLinodeRequestFactory.build();
const linodeData = {
  ...linodeRequest,
  stackscript_id: 10079,
  stackscript_data: {
    gh_username: 'linode',
  },
};

const linodeDataForCLI = `
--label linode-1
--root_pass aComplex@Password
--region us-east
--type g6-standard-2
--stackscript_id 10079
--stackscript_data '{"gh_username": "linode"}'
`
  .trimStart()
  .trimEnd();

const generatedCommand = generateCLICommand(linodeData);

describe('generateCLICommand', () => {
  it('should return a linode-cli linodes create command', () => {
    expect(
      generatedCommand.startsWith('linode-cli linodes create')
    ).toBeTruthy();
  });

  it('should return a linode-cli command with the data provided formatted as arguments', () => {
    expect(generatedCommand).toMatch(linodeDataForCLI);
  });
});
