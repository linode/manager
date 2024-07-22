import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { OperatingSystems } from './OperatingSystems';

describe('OperatingSystems', () => {
  it('renders a header', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <OperatingSystems />,
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
      component: <OperatingSystems />,
    });

    expect(getByLabelText('Linux Distribution')).toBeVisible();
    expect(getByPlaceholderText('Choose a Linux distribution')).toBeVisible();
  });
});
