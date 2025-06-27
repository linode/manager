import { linodeFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeSettingsMaintenancePolicyPanel } from './LinodeSettingsMaintenancePolicyPanel';

describe('LinodeSettingsMaintenancePolicyPanel', () => {
  it('should render the selected maintenance policy', async () => {
    server.use(
      http.get('*/linode/instances/1', () => {
        return HttpResponse.json(
          linodeFactory.build({
            id: 1,
            maintenance_policy: 'linode/power_off_on',
          })
        );
      })
    );

    const { getByLabelText, getByText } = renderWithTheme(
      <LinodeSettingsMaintenancePolicyPanel linodeId={1} />
    );

    // Check for Header
    expect(getByText('Host Maintenance Policy')).toBeVisible();

    const input = getByLabelText('Maintenance Policy');
    const button = getByText('Save').closest('button');

    await waitFor(() => {
      // Verify the input contains the Linode's label when it loads it
      expect(input).toHaveValue('Power Off / Power On');
    });

    // Verify that the save button is disabled (because the label is unmodified)
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should disable the input if the `isReadOnly` prop is true', async () => {
    server.use(
      http.get('*/linode/instances/1', () => {
        return HttpResponse.json(
          linodeFactory.build({
            id: 1,
            maintenance_policy: 'linode/power_off_on',
          })
        );
      })
    );

    const { getByLabelText } = renderWithTheme(
      <LinodeSettingsMaintenancePolicyPanel isReadOnly linodeId={1} />
    );

    const input = getByLabelText('Maintenance Policy');

    expect(input).toBeDisabled();
  });
});
