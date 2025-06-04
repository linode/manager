import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { serviceAlertFactory, serviceTypesFactory } from 'src/factories';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { AlertEntityScopeSelect } from './AlertEntityScopeSelect';

const queryMock = vi.hoisted(() => ({
  useCloudPulseServiceByType: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/services.ts', async (importOriginal) => ({
  ...(await importOriginal()),
  useCloudPulseServiceByType: queryMock.useCloudPulseServiceByType,
}));

describe('AlertEntityGroupingSelect', () => {
  it('should render the component', () => {
    queryMock.useCloudPulseServiceByType.mockReturnValue({
      isLoading: false,
      data: serviceTypesFactory.build(),
    });
    renderWithThemeAndHookFormContext({
      component: <AlertEntityScopeSelect name="group" serviceType="linode" />,
    });

    expect(screen.getByTestId('entity-grouping')).toBeInTheDocument();
    expect(screen.getByLabelText('Scope')).toBeInTheDocument();
  });

  it('Select option from drop down', async () => {
    renderWithThemeAndHookFormContext({
      component: <AlertEntityScopeSelect name="group" serviceType="dbaas" />,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(screen.getByRole('option', { name: 'Account' }));

    expect(screen.getByRole('combobox')).toHaveAttribute('value', 'Account');
  });

  it('should disable options that are not available for the service type', async () => {
    queryMock.useCloudPulseServiceByType.mockReturnValue({
      isLoading: false,
      data: serviceTypesFactory.build({
        alert: serviceAlertFactory.build({
          scope: ['entity'],
        }),
      }),
    });

    renderWithThemeAndHookFormContext({
      component: <AlertEntityScopeSelect name="group" serviceType="dbaas" />,
    });

    expect(screen.getByRole('combobox')).toHaveAttribute('value', 'Entity');

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(screen.getByRole('option', { name: 'Account' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
});
