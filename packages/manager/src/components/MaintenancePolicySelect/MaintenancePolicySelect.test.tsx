import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';

import { maintenancePolicyFactory } from 'src/factories/maintenancePolicy';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { MaintenancePolicySelect } from './MaintenancePolicySelect';

import type { MaintenancePolicyOption } from './constants';
import type { MaintenancePolicyId } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useAccountMaintenancePoliciesQuery: vi.fn().mockReturnValue({}),
  useRegionQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccountMaintenancePoliciesQuery:
      queryMocks.useAccountMaintenancePoliciesQuery,
    useRegionQuery: queryMocks.useRegionQuery,
  };
});

describe('MaintenancePolicySelect', () => {
  beforeEach(() => {
    queryMocks.useRegionQuery.mockReturnValue({
      data: {
        capabilities: ['Maintenance Policy'],
        id: 'us-east',
      },
    });

    queryMocks.useAccountMaintenancePoliciesQuery.mockReturnValue({
      data: [
        maintenancePolicyFactory.build({ id: 1, name: 'Migrate' }),
        maintenancePolicyFactory.build({ id: 2, name: 'Power Off / Power On' }),
      ],
      isFetching: false,
    });
  });

  it('should render a label', () => {
    const { getByLabelText } = renderWithTheme(
      <MaintenancePolicySelect onChange={vi.fn()} value={1} />
    );

    expect(getByLabelText('Maintenance Policy')).toBeVisible();
  });

  it('should be disabled when no region is selected', () => {
    queryMocks.useRegionQuery.mockReturnValue({ data: null });

    const { getByRole } = renderWithTheme(
      <MaintenancePolicySelect
        disabled={true}
        onChange={vi.fn()}
        value={undefined}
      />
    );

    expect(getByRole('combobox')).toBeDisabled();
  });

  it('should be disabled when region does not support maintenance policy', () => {
    queryMocks.useRegionQuery.mockReturnValue({
      data: {
        capabilities: [],
        id: 'us-east',
      },
    });

    const { getByRole } = renderWithTheme(
      <MaintenancePolicySelect
        disabled={true}
        onChange={vi.fn()}
        value={undefined}
      />
    );

    expect(getByRole('combobox')).toBeDisabled();
  });

  it('should show helper text when region does not support maintenance policy', () => {
    queryMocks.useRegionQuery.mockReturnValue({
      data: {
        capabilities: [],
        id: 'us-east',
      },
    });

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

  it('should show maintenance policy options when region supports it', async () => {
    const { getByRole, getByText } = renderWithTheme(
      <MaintenancePolicySelect onChange={vi.fn()} value={undefined} />
    );

    await userEvent.click(getByRole('combobox'));

    expect(getByText('Migrate')).toBeVisible();
    expect(getByText('Power Off / Power On')).toBeVisible();
  });

  it('should call onChange when selecting a policy', async () => {
    const onChange = vi.fn();
    const { getByRole, getByText } = renderWithTheme(
      <MaintenancePolicySelect onChange={onChange} value={1} />
    );

    await userEvent.click(getByRole('combobox'));
    await userEvent.click(getByText('Power Off / Power On'));

    expect(onChange).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        value: 2,
        label: 'Power Off / Power On',
        description: expect.any(String),
      }),
      'selectOption',
      expect.any(Object)
    );
  });

  it('should use provided options when available', async () => {
    const customOptions: MaintenancePolicyOption[] = [
      {
        label: 'Custom Option 1',
        value: 1 as MaintenancePolicyId,
        description: 'Description 1',
      },
      {
        label: 'Custom Option 2',
        value: 2 as MaintenancePolicyId,
        description: 'Description 2',
      },
    ];

    const { getByRole, getByText } = renderWithTheme(
      <MaintenancePolicySelect
        onChange={vi.fn()}
        options={customOptions}
        value={undefined}
      />
    );

    await userEvent.click(getByRole('combobox'));

    expect(getByText('Custom Option 1')).toBeVisible();
    expect(getByText('Custom Option 2')).toBeVisible();
  });
});
