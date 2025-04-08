import { createLinodeRequestFactory } from '@linode/utilities';

import { generateCLICommand } from './generate-cli';

const linodeRequest = createLinodeRequestFactory.build();

const linodeData = {
  ...linodeRequest,
  authorized_users: ['Linny', 'Gritty'],
  backup_id: undefined,
  interfaces: [
    {
      ipam_address: null,
      ipv4: {
        nat_1_1: 'any',
        vpc: '123',
      },
      label: null,
      primary: true,
      purpose: 'vpc',
      subnet_id: 8296,
      vpc_id: 7403,
    },
  ],
  metadata: {
    user_data: 'cmVrbmpnYmloZXVma2xkbQpqZXZia2Y=',
  },
  placement_group: {
    id: 1234,
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
  --interfaces.ipam_address null --interfaces.ipv4.nat_1_1 \"any\" --interfaces.ipv4.vpc \"123\" --interfaces.label null --interfaces.primary true --interfaces.purpose \"vpc\" --interfaces.subnet_id 8296 \\
  --metadata.user_data="cmVrbmpnYmloZXVma2xkbQpqZXZia2Y=" \\
  --placement_group.id 1234 \\
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
