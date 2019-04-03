import { canUserModifyStackScript } from './stackScriptUtils';

describe('canUserModifyStackScript', () => {
  let isRestrictedUser = false;
  const stackScriptGrants: Linode.Grant[] = [
    { id: 1, permissions: 'read_only', label: 'my_stackscript' },
    { id: 2, permissions: 'read_write', label: 'my__other_stackscript' }
  ];
  let stackScriptID = 1;
  let isPublic = true;

  it('should return false if StackScript is public', () => {
    isPublic = true;
    expect(
      canUserModifyStackScript(
        isRestrictedUser,
        stackScriptGrants,
        stackScriptID,
        isPublic
      )
    ).toBe(false);
  });

  it("should return true if the user isn't restricted and the StackScript isn't public", () => {
    isRestrictedUser = false;
    isPublic = false;
    expect(
      canUserModifyStackScript(
        isRestrictedUser,
        stackScriptGrants,
        stackScriptID,
        isPublic
      )
    ).toBe(true);
  });

  it('should return true if the user is restricted but has read_write grants for this StackScript', () => {
    isRestrictedUser = true;
    stackScriptID = 2;
    expect(
      canUserModifyStackScript(
        isRestrictedUser,
        stackScriptGrants,
        stackScriptID,
        isPublic
      )
    ).toBe(true);

    stackScriptID = 1;
    expect(
      canUserModifyStackScript(
        isRestrictedUser,
        stackScriptGrants,
        stackScriptID,
        isPublic
      )
    ).toBe(false);
  });
});
