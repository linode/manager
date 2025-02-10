import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NetworkInterfaceType } from './NetworkInterfaceType';

import type { LinodeInterfaceAccountSetting } from '@linode/api-v4';

const props = {
  interfacesSetting: 'legacy_config_only' as LinodeInterfaceAccountSetting,
  updateInterfaceSettings: vi.fn(),
};
describe('NetworkInterfaces', () => {
  it('renders the NetworkInterfaces accordion', () => {
    const { getByText } = renderWithTheme(<NetworkInterfaceType {...props} />);

    expect(getByText('Network Interface Type')).toBeVisible();
    expect(getByText('Interfaces for new Linodes')).toBeVisible();
    expect(getByText('Save')).toBeVisible();
  });

  it('confirms updateInterfaceSettings is called when clicking save', async () => {
    const { getByText } = renderWithTheme(<NetworkInterfaceType {...props} />);

    const saveButton = getByText('Save');
    await userEvent.click(saveButton);

    expect(props.updateInterfaceSettings).toHaveBeenCalled();
  });
});
