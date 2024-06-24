import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Distributions } from './Distributions';

describe('Distributions', () => {
  it('renders a header', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Distributions />,
    });

    const header = getByText('Choose an OS');

    expect(header).toBeVisible();
    expect(header.tagName).toBe('H2');
  });

  it('renders an image select', () => {
    const {
      getByLabelText,
      getByPlaceholderText,
    } = renderWithThemeAndHookFormContext({
      component: <Distributions />,
    });

    expect(getByLabelText('Images')).toBeVisible();
    expect(getByPlaceholderText('Choose an image')).toBeVisible();
  });
});
