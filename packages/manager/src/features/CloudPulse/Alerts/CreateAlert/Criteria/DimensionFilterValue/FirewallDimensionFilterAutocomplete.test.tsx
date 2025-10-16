import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { FirewallDimensionFilterAutocomplete } from './FirewallDimensionFilterAutocomplete';

const queryMocks = vi.hoisted(() => ({
  useRegionsQuery: vi.fn(),
  useFirewallFetchOptions: vi.fn(),
}));

vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
  useRegionsQuery: queryMocks.useRegionsQuery.mockReturnValue({ data: [] }),
}));

vi.mock('./useFirewallFetchOptions', () => ({
  ...vi.importActual('./useFirewallFetchOptions'),
  useFirewallFetchOptions: queryMocks.useFirewallFetchOptions,
}));

import type { DimensionFilterAutocompleteProps } from './constants';

describe('<FirewallDimensionFilterAutocomplete />', () => {
  const defaultProps: DimensionFilterAutocompleteProps = {
    name: 'dimension-filter',
    dimensionLabel: 'linode_id',
    disabled: false,
    errorText: undefined,
    fieldOnBlur: vi.fn(),
    fieldOnChange: vi.fn(),
    fieldValue: null,
    multiple: false,
    placeholderText: 'Select value',
    entities: [],
    scope: 'account',
    serviceType: 'firewall',
    type: 'alerts',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with options when values are provided', () => {
    queryMocks.useFirewallFetchOptions.mockReturnValue({
      values: [
        { label: 'Linode-1', value: '1' },
        { label: 'Linode-2', value: '2' },
      ],
      isLoading: false,
      isError: false,
    });

    renderWithTheme(<FirewallDimensionFilterAutocomplete {...defaultProps} />);
    expect(screen.getByLabelText(/Value/i)).toBeVisible();
    expect(screen.getByPlaceholderText('Select value')).toBeVisible();
  });

  it('calls fieldOnBlur when input is blurred', async () => {
    queryMocks.useFirewallFetchOptions.mockReturnValue({
      values: [],
      isLoading: false,
      isError: false,
    });

    const user = userEvent.setup();
    renderWithTheme(<FirewallDimensionFilterAutocomplete {...defaultProps} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.tab();
    expect(defaultProps.fieldOnBlur).toHaveBeenCalled();
  });

  it('disables the Autocomplete when disabled is true', () => {
    queryMocks.useFirewallFetchOptions.mockReturnValue({
      values: [],
      isLoading: false,
      isError: false,
    });

    renderWithTheme(
      <FirewallDimensionFilterAutocomplete {...defaultProps} disabled />
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('renders error text from props', () => {
    queryMocks.useFirewallFetchOptions.mockReturnValue({
      values: [],
      isLoading: false,
      isError: false,
    });

    renderWithTheme(
      <FirewallDimensionFilterAutocomplete
        {...defaultProps}
        errorText="Custom error"
      />
    );
    expect(screen.getByText('Custom error')).toBeVisible();
  });

  it('renders API error text when isError is true', async () => {
    queryMocks.useFirewallFetchOptions.mockReturnValue({
      values: [],
      isLoading: false,
      isError: true,
    });

    renderWithTheme(<FirewallDimensionFilterAutocomplete {...defaultProps} />);
    expect(
      await screen.findByText('Failed to fetch the values.')
    ).toBeVisible();
  });

  it('shows loading state when fetching values', () => {
    queryMocks.useFirewallFetchOptions.mockReturnValue({
      values: [],
      isLoading: true,
      isError: false,
    });

    renderWithTheme(<FirewallDimensionFilterAutocomplete {...defaultProps} />);
    expect(screen.getByTestId('circle-progress')).toBeVisible();
  });

  it('calls fieldOnChange with correct value when selecting an option (single)', async () => {
    queryMocks.useFirewallFetchOptions.mockReturnValue({
      values: [{ label: 'Linode-1', value: '1' }],
      isLoading: false,
      isError: false,
    });

    const user = userEvent.setup();
    const fieldOnChange = vi.fn();
    renderWithTheme(
      <FirewallDimensionFilterAutocomplete
        {...defaultProps}
        fieldOnChange={fieldOnChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('option', { name: /Linode-1/ }));
    expect(fieldOnChange).toHaveBeenCalledWith('1');
  });

  it('calls fieldOnChange with multiple values when multiple=true', async () => {
    queryMocks.useFirewallFetchOptions.mockReturnValue({
      values: [
        { label: 'Linode-1', value: '1' },
        { label: 'Linode-2', value: '2' },
      ],
      isLoading: false,
      isError: false,
    });

    const user = userEvent.setup();
    const fieldOnChange = vi.fn();

    const { rerender } = renderWithTheme(
      <FirewallDimensionFilterAutocomplete
        {...defaultProps}
        fieldOnChange={fieldOnChange}
        fieldValue={null}
        multiple
      />
    );

    // Select first option
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('option', { name: /Linode-1/ }));
    expect(fieldOnChange).toHaveBeenCalledWith('1');

    // Rerender with updated form state
    rerender(
      <FirewallDimensionFilterAutocomplete
        {...defaultProps}
        fieldOnChange={fieldOnChange}
        fieldValue={fieldOnChange.mock.calls[0][0]}
        multiple
      />
    );

    // Select second option
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('option', { name: /Linode-2/ }));

    expect(fieldOnChange).toHaveBeenCalledWith('1,2');
  });

  it('renders and selects option correctly for account scope with dimensionLabel=linode_id', async () => {
    queryMocks.useFirewallFetchOptions.mockReturnValue({
      values: [{ label: 'Linode-Account-1', value: 'acc-1' }],
      isLoading: false,
      isError: false,
    });

    const user = userEvent.setup();
    renderWithTheme(
      <FirewallDimensionFilterAutocomplete
        {...defaultProps}
        dimensionLabel="linode_id"
        scope="account"
      />
    );

    const input = await screen.findByRole('combobox');
    expect(input).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(
      await screen.findByRole('option', { name: 'Linode-Account-1' })
    ).toBeVisible();
  });

  it('renders and selects option correctly for account scope with dimensionLabel=region_id', async () => {
    queryMocks.useFirewallFetchOptions.mockReturnValue({
      values: [{ label: 'us-east', value: 'us-east' }],
      isLoading: false,
      isError: false,
    });

    const user = userEvent.setup();
    renderWithTheme(
      <FirewallDimensionFilterAutocomplete
        {...defaultProps}
        dimensionLabel="region_id"
        scope="account"
      />
    );

    const input = await screen.findByRole('combobox');
    expect(input).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(
      await screen.findByRole('option', { name: 'us-east' })
    ).toBeVisible();
  });
});
