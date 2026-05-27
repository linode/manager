import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { LinodeIPAddressSelection } from './LinodeIPAddressSelection';

describe('LinodeIPAddressSelection', () => {
  it('renders IP Address selection with title, auto-assigned and reserved radio buttons.', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <LinodeIPAddressSelection index={0} />,
    });

    expect(getByText('IP Address')).toBeInTheDocument();
    expect(getByText('Auto-assigned')).toBeInTheDocument();
    expect(getByText('Reserved')).toBeInTheDocument();
  });

  it('renders with Auto mode selected by default', () => {
    const { getAllByRole } = renderWithThemeAndHookFormContext({
      component: <LinodeIPAddressSelection index={0} />,
    });

    const radios = getAllByRole('radio');
    expect(radios[0]).toBeChecked(); // Auto-assigned
    expect(radios[1]).not.toBeChecked(); // Reserved
  });
});
