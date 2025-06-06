import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { MaintenancePolicySelect } from './MaintenancePolicySelect';

describe('MaintenancePolicySelect', () => {
  it('should render a label', () => {
    const { getByLabelText } = renderWithTheme(
      <MaintenancePolicySelect onChange={vi.fn()} value={1} />
    );

    expect(getByLabelText('Maintenance Policy')).toBeVisible();
  });

  it('should display an error', () => {
    const { getByText } = renderWithTheme(
      <MaintenancePolicySelect
        errorText="An error"
        onChange={vi.fn()}
        value={1}
      />
    );
    expect(getByText('An error')).toBeInTheDocument();
  });

  it('should render policy options', async () => {
    const { getByRole, getByText } = renderWithTheme(
      <MaintenancePolicySelect onChange={vi.fn()} value={1} />
    );

    await userEvent.click(getByRole('combobox'));

    expect(getByText('Migrate')).toBeVisible();
    expect(getByText('Power Off / Power On')).toBeVisible();
  });

  it('should call onChange', async () => {
    const onChange = vi.fn();

    const { getByRole, getByText } = renderWithTheme(
      <MaintenancePolicySelect
        onChange={(_, option) => onChange(option.value)}
        value={1}
      />
    );

    await userEvent.click(getByRole('combobox'));

    expect(getByText('Migrate')).toBeVisible();
    expect(getByText('Power Off / Power On')).toBeVisible();

    await userEvent.click(getByText('Power Off / Power On'));

    expect(onChange).toBeCalledWith(2);
  });
});
