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
  it('renders a generic "tux" when there is no value in the `distroIcons` map', () => {
    const { getByTestId } = renderWithTheme(
      <DistributionIcon distribution="hdshkgsvkguihsh" />
    );

    expect(getByTestId('distro-icon')).toHaveClass('fl-tux');
  });
  it('defaults to 1.8em', () => {
    const { getByTestId } = renderWithTheme(
      <DistributionIcon distribution="Alpine" />
    );

    expect(getByTestId('distro-icon')).toHaveStyle({ fontSize: '1.8em' });
  });
  it('allows size to be overwritten', () => {
    const { getByTestId } = renderWithTheme(
      <DistributionIcon distribution="Alpine" size="14px" />
    );

    expect(getByTestId('distro-icon')).toHaveStyle({ fontSize: '14px' });
  });
});
