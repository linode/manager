import { canUserModifyAccountStackScript } from './stackScriptUtils';

describe('canUserModifyStackScript', () => {
  let isRestrictedUser = false;
  const stackScriptGrants: Linode.Grant[] = [
    { id: 1, permissions: 'read_only', label: 'my_stackscript' },
    { id: 2, permissions: 'read_write', label: 'my__other_stackscript' }
  ];
  let stackScriptID = 1;

  it("should return true if the user isn't restricted", () => {
    isRestrictedUser = false;
    expect(
      canUserModifyAccountStackScript(
        isRestrictedUser,
        stackScriptGrants,
        stackScriptID
      )
    ).toBe(true);
  });

  it('should return true if the user is restricted but has read_write grants for this StackScript', () => {
    isRestrictedUser = true;
    stackScriptID = 2;
    expect(
      canUserModifyAccountStackScript(
        isRestrictedUser,
        stackScriptGrants,
        stackScriptID
      )
    ).toBe(true);

    stackScriptID = 1;
    expect(
      canUserModifyAccountStackScript(
        isRestrictedUser,
        stackScriptGrants,
        stackScriptID
      )
    ).toBe(false);
  });
});
