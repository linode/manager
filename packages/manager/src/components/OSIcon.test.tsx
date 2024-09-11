import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { OSIcon } from './OSIcon';

describe('OSIcon', () => {
  it('renders the correct font-logos clasname', () => {
    const { getByTestId } = renderWithTheme(<OSIcon os="Ubuntu" />);

    expect(getByTestId('os-icon')).toHaveClass('fl-ubuntu');
  });
  it('renders the correct font-logos clasname', () => {
    const { getByTestId } = renderWithTheme(<OSIcon os="Rocky" />);

    expect(getByTestId('os-icon')).toHaveClass('fl-rocky-linux');
  });
  it('renders a generic "tux" when there is no value in the `OS_ICONS` map', () => {
    const { getByTestId } = renderWithTheme(<OSIcon os="hdshkgsvkguihsh" />);

    expect(getByTestId('os-icon')).toHaveClass('fl-tux');
  });
});
