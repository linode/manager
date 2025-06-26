import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { accountSettingsFactory } from 'src/factories';
import { maintenancePolicyFactory } from 'src/factories/maintenancePolicy';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { MaintenancePolicySelect } from './MaintenancePolicySelect';

describe('MaintenancePolicySelect', () => {
  it('should render a label', () => {
    const { getByLabelText } = renderWithTheme(
      <MaintenancePolicySelect onChange={vi.fn()} value={'linode/migrate'} />
    );

    expect(getByLabelText('Maintenance Policy')).toBeVisible();
  });

  it('should be disabled when disabled prop is true', () => {
    const { getByRole } = renderWithTheme(
      <MaintenancePolicySelect
        disabled={true}
        onChange={vi.fn()}
        value={undefined}
      />
    );

    expect(getByRole('combobox')).toBeDisabled();
  });

  it('should show helper text from props', () => {
    const { getByText } = renderWithTheme(
      <MaintenancePolicySelect
        onChange={vi.fn()}
        textFieldProps={{
          helperText: 'Maintenance Policy is not available in this region.',
        }}
        value={undefined}
      />
    );

    expect(
      getByText('Maintenance Policy is not available in this region.')
    ).toBeVisible();
  });

  it('should show maintenance policy options returned by the API', async () => {
    const policies = [
      maintenancePolicyFactory.build({ label: 'Power Off / Power On' }),
      maintenancePolicyFactory.build({ label: 'Migrate' }),
    ];

    server.use(
      http.get('*/maintenance/policies', () => {
        return HttpResponse.json(makeResourcePage(policies));
      })
    );

    const { getByRole, findByText } = renderWithTheme(
      <MaintenancePolicySelect onChange={vi.fn()} value={undefined} />
    );

    await userEvent.click(getByRole('combobox'));

    expect(await findByText('Migrate')).toBeVisible();
    expect(await findByText('Power Off / Power On')).toBeVisible();
  });

  it('should call onChange with the policy when one is chosen', async () => {
    const onChange = vi.fn();
    const policies = [
      maintenancePolicyFactory.build({ label: 'Power Off / Power On' }),
      maintenancePolicyFactory.build({ label: 'Migrate' }),
    ];

    server.use(
      http.get('*/maintenance/policies', () => {
        return HttpResponse.json(makeResourcePage(policies));
      })
    );

    const { getByRole, findByText } = renderWithTheme(
      <MaintenancePolicySelect onChange={onChange} />
    );

    await userEvent.click(getByRole('combobox'));

    const option = await findByText('Power Off / Power On');

    await userEvent.click(option);

    expect(onChange).toHaveBeenCalledWith({
      ...policies[0],
      label: policies[0].label,
    });
  });

  it('should show a default chip for the account default', async () => {
    const policies = [
      maintenancePolicyFactory.build({
        label: 'Power Off / Power On',
        slug: 'linode/power_off_on',
      }),
      maintenancePolicyFactory.build({
        label: 'Migrate',
        slug: 'linode/migrate',
      }),
    ];
    const accountSettings = accountSettingsFactory.build({
      maintenance_policy: 'linode/migrate',
    });

    server.use(
      http.get('*/maintenance/policies', () => {
        return HttpResponse.json(makeResourcePage(policies));
      }),
      http.get('*/account/settings', () => {
        return HttpResponse.json(accountSettings);
      })
    );

    const { getByRole, findByText } = renderWithTheme(
      <MaintenancePolicySelect onChange={vi.fn()} value={undefined} />
    );

    await userEvent.click(getByRole('combobox'));

    expect(await findByText('Migrate')).toBeVisible();
    expect(await findByText('Power Off / Power On')).toBeVisible();

    expect(await findByText('DEFAULT')).toBeVisible();
  });
});
