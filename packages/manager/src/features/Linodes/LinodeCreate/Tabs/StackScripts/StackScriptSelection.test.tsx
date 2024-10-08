import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StackScriptSelection } from './StackScriptSelection';

describe('StackScriptSelection', () => {
  it('should select tab based on query params', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <StackScriptSelection />,
      options: {
        MemoryRouter: {
          initialEntries: [
            '/linodes/create?type=StackScripts&subtype=Community',
          ],
        },
      },
    });

    const communityTabButton = getByText('Community StackScripts');

    expect(communityTabButton).toHaveAttribute('aria-selected', 'true');
  });
});
