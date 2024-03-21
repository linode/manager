import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Images } from './Images';

describe('Images', () => {
  it('renders a header', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Images />,
    });

    const header = getByText('Choose an Image');

    expect(header).toBeVisible();
    expect(header.tagName).toBe('H2');
  });

  it('renders an image select', () => {
    const {
      getByLabelText,
      getByPlaceholderText,
    } = renderWithThemeAndHookFormContext({
      component: <Images />,
    });

    expect(getByLabelText('Images')).toBeVisible();
    expect(getByPlaceholderText('Choose an image')).toBeVisible();
  });
});
