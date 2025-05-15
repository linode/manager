import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { VPCRanges } from './VPCRanges';

describe('VPCRanges', () => {
  it('renders IP ranges from form data', () => {
    const { getByDisplayValue, getByLabelText } =
      renderWithThemeAndHookFormContext({
        component: <VPCRanges />,
        useFormOptions: {
          defaultValues: {
            interfaces: [
              { ip_ranges: ['192.168.1.1/24'], subnet_id: 5, vpc_id: 4 },
              {},
              {},
            ],
            region: 'fake-region',
          },
        },
      });

    expect(getByDisplayValue('192.168.1.1/24')).toBeVisible();
    expect(getByLabelText('Remove IP Range 0')).toBeVisible();
  });

  it('can add an IP range', async () => {
    const { getByPlaceholderText, getByText } =
      renderWithThemeAndHookFormContext({
        component: <VPCRanges />,
        useFormOptions: {
          defaultValues: {
            interfaces: [{ ip_ranges: [], subnet_id: 5, vpc_id: 4 }, {}, {}],
            region: 'fake-region',
          },
        },
      });

    const addButton = getByText('Add IPv4 Range');

    expect(addButton).toBeVisible();
    expect(addButton).toBeEnabled();

    await userEvent.click(addButton);

    expect(getByPlaceholderText('10.0.0.0/24')).toBeVisible();
  });

  it('can remove an IP range', async () => {
    const { getByLabelText, queryByDisplayValue } =
      renderWithThemeAndHookFormContext({
        component: <VPCRanges />,
        useFormOptions: {
          defaultValues: {
            interfaces: [
              { ip_ranges: ['192.168.1.1/24'], subnet_id: 5, vpc_id: 4 },
              {},
              {},
            ],
            region: 'fake-region',
          },
        },
      });

    const removeButton = getByLabelText('Remove IP Range 0');

    expect(removeButton).toBeVisible();
    expect(removeButton).toBeEnabled();

    await userEvent.click(removeButton);

    expect(queryByDisplayValue('192.168.1.1/24')).toBeNull();
  });
});
