import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { InterfaceType } from './InterfaceType';

import type { LinodeCreateFormValues } from '../utilities';

const defaultFormValues: Partial<LinodeCreateFormValues> = {
  interface_generation: 'linode',
  linodeInterfaces: [
    {
      purpose: 'public',
      firewall_id: null,
      vpc: null,
      public: null,
      vlan: null,
      default_route: null,
    },
  ],
};

describe('InterfaceType', () => {
  it('renders all interface type options', () => {
    const { getByText, getByRole } = renderWithThemeAndHookFormContext({
      component: <InterfaceType index={0} />,
      useFormOptions: {
        defaultValues: defaultFormValues,
      },
    });

    // Check that the form label is rendered
    expect(getByText('Network Connection')).toBeVisible();

    // Check that all three interface options are rendered
    expect(getByText('Public Internet')).toBeVisible();
    expect(getByText('VPC')).toBeVisible();
    expect(getByText('VLAN')).toBeVisible();

    // Check that radiogroup is rendered
    expect(getByRole('radiogroup')).toBeVisible();
  });

  it('renders tooltip icons for each interface type', () => {
    const { getAllByRole } = renderWithThemeAndHookFormContext({
      component: <InterfaceType index={0} />,
      useFormOptions: {
        defaultValues: defaultFormValues,
      },
    });

    // Should have tooltip buttons for each interface option
    const tooltipButtons = getAllByRole('button');
    expect(tooltipButtons.length).toBe(3);
  });

  it('selects the correct radio based on form value', () => {
    const { getByDisplayValue } = renderWithThemeAndHookFormContext({
      component: <InterfaceType index={0} />,
      useFormOptions: {
        defaultValues: {
          ...defaultFormValues,
          linodeInterfaces: [
            {
              purpose: 'vpc',
              firewall_id: null,
            },
          ],
        },
      },
    });

    expect(getByDisplayValue('vpc')).toBeChecked();
  });

  it('allows user to change interface type selection', async () => {
    const { getByDisplayValue } = renderWithThemeAndHookFormContext({
      component: <InterfaceType index={0} />,
      useFormOptions: {
        defaultValues: defaultFormValues,
      },
    });

    // Initially public should be selected
    expect(getByDisplayValue('public')).toBeChecked();

    // Click on VPC radio
    await userEvent.click(getByDisplayValue('vpc'));

    // VPC should now be selected
    expect(getByDisplayValue('vpc')).toBeChecked();
    expect(getByDisplayValue('public')).not.toBeChecked();
  });
});
