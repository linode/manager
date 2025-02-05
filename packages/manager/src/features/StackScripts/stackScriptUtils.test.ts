import {
  canUserModifyAccountStackScript,
  getStackScriptImages,
} from './stackScriptUtils';

import type { Grant } from '@linode/api-v4';

describe('canUserModifyStackScript', () => {
  let isRestrictedUser = false;
  const stackScriptGrants: Grant[] = [
    { id: 1, label: 'my_stackscript', permissions: 'read_only' },
    { id: 2, label: 'my__other_stackscript', permissions: 'read_write' },
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

    stackScriptID = 100;
    expect(
      canUserModifyAccountStackScript(
        isRestrictedUser,
        stackScriptGrants,
        stackScriptID
      )
    ).toBe(false);
  });
});

describe('getStackScriptImages', () => {
  it('removes the linode/ prefix from Image IDs', () => {
    const images = ['linode/ubuntu20.04', 'linode/debian9'];
    expect(getStackScriptImages(images)).toBe('ubuntu20.04, debian9');
  });
  it('removes the handles images without the linode/ prefix', () => {
    const images = ['ubuntu20.04', 'linode/debian9'];
    expect(getStackScriptImages(images)).toBe('ubuntu20.04, debian9');
  });
  it('gracefully handles a null image', () => {
    const images = ['linode/ubuntu20.04', null, 'linode/debian9'];
    // @ts-expect-error intentionally testing invalid value because API is known to return null
    expect(getStackScriptImages(images)).toBe('ubuntu20.04, debian9');
  });
});
