import generateCLICommand from './generate-cli';
import { createLinodeRequestFactory } from 'src/factories/linodes';

const linodeRequest = createLinodeRequestFactory.build();

const linodeData = {
  ...linodeRequest,
  stackscript_id: 10079,
  stackscript_data: {
    gh_username: 'linode',
  },
  backup_id: undefined,
  authorized_users: ['Linny', 'Gritty'],
};

const linodeDataForCLI = `
  --label '${linodeRequest.label}' \\
  --root_pass '${linodeRequest.root_pass}' \\
  --image '${linodeRequest.image}' \\
  --type '${linodeRequest.type}' \\
  --region '${linodeRequest.region}' \\
  --booted '${linodeRequest.booted}' \\
  --stackscript_id '10079' \\
  --stackscript_data '{"gh_username": "linode"}' \\
  --authorized_users Linny \\
  --authorized_users Gritty
`.trim();

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

  it('should not return a linode-cli command with undefined fields', () => {
    expect(generatedCommand).not.toMatch('undefined');
  });

  it('should parse array fields as multiple command args with the same key but diffeerent values', () => {
    expect(generatedCommand).toMatch('--authorized_users Linny');
    expect(generatedCommand).toMatch('--authorized_users Gritty');
  });
});
