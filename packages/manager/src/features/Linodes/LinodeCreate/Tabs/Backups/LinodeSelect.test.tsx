import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { LinodeSelect } from './LinodeSelect';

describe('LinodeSelect', () => {
  it('should render a heading', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <LinodeSelect />,
    });

    const heading = getByText('Select Linode');

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });
});
