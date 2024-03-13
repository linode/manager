import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DistributionIcon } from './DistributionIcon';

describe('DistributionIcon', () => {
  it('renders the correct font-logos clasname', () => {
    const { getByTestId } = renderWithTheme(
      <DistributionIcon distribution="Ubuntu" />
    );

    expect(getByTestId('distro-icon')).toHaveClass('fl-ubuntu');
  });
  it('renders the correct font-logos clasname', () => {
    const { getByTestId } = renderWithTheme(
      <DistributionIcon distribution="Rocky" />
    );

    expect(getByTestId('distro-icon')).toHaveClass('fl-rocky-linux');
  });
  it('allows size to be overwritten', () => {
    const { getByTestId } = renderWithTheme(
      <DistributionIcon distribution="Rocky" size="14px" />
    );

    expect(getByTestId('distro-icon')).toHaveStyle({ fontSize: '14px' });
  });
});
