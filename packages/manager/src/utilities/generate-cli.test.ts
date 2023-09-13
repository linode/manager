import { createLinodeRequestFactory } from 'src/factories/linodes';

import { generateCLICommand } from './generate-cli';

const linodeRequest = createLinodeRequestFactory.build();

const linodeData = {
  ...linodeRequest,
  authorized_users: ['Linny', 'Gritty'],
  backup_id: undefined,
  metadata: {
    user_data: 'cmVrbmpnYmloZXVma2xkbQpqZXZia2Y=',
  },
  stackscript_data: {
    gh_username: 'linode',
  },
  stackscript_id: 10079,
};

const linodeDataForCLI = `
  linode-cli linodes create \\
  --booted ${linodeRequest.booted} \\
  --image ${linodeRequest.image} \\
  --label ${linodeRequest.label} \\
  --region ${linodeRequest.region} \\
  --root_pass ${linodeRequest.root_pass} \\
  --type ${linodeRequest.type} \\
  --authorized_users Linny \\
  --authorized_users Gritty \\
  --metadata.user_data="cmVrbmpnYmloZXVma2xkbQpqZXZia2Y=" \\
  --stackscript_data '{"gh_username": "linode"}' \\
  --stackscript_id 10079
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

  describe('parsing of string arguments', () => {
    it.skip('should escape strings that contain single quotes, double quotes, and forward slashes', () => {
      const password = `@C@mplexP@ssword'"\\`;
      const escapedPassword = `@C@mplexP@ssword\\\'\\\"\\\\\\`;
      const linodeRequest = createLinodeRequestFactory.build({
        root_pass: password,
      });
      const cliCommand = generateCLICommand(linodeRequest);
      expect(cliCommand).toMatch(`--root_pass $'${escapedPassword}'`);
    });
  });
});
