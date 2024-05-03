import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Clone } from './Clone';

describe('Clone', () => {
  it('should render a heading', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Clone />,
    });

    const heading = getByText('Select Linode to Clone From');

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });
});
