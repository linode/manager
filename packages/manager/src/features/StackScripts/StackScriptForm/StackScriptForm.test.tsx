import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StackScriptForm } from './StackScriptForm';

describe('StackScriptCreate', () => {
  it('should render', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <StackScriptForm disabled={false} username="test" />,
    });
    getByText(/stackscript label/i);
  });
});
