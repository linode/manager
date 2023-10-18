import { render } from '@testing-library/react';
import * as React from 'react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import { StackScriptsLanding } from './StackScriptsLanding';

vi.mock('@linode/api-v4/lib/account', () => ({
  getUsers: vi.fn().mockResolvedValue({}),
}));

describe('StackScripts Landing', () => {
  const { getByText } = render(wrapWithTheme(<StackScriptsLanding />));

  it('icon text link text should read "Create StackScript"', () => {
    getByText(/create stackscript/i);
  });
});
