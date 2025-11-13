import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { BlockStorageDimensionFilterAutocomplete } from './BlockStorageDimensionFilterAutocomplete';

import type { DimensionFilterAutocompleteProps } from './constants';

const queryMocks = vi.hoisted(() => ({
  useRegionsQuery: vi.fn(),
  useBlockStorageFetchOptions: vi.fn(),
}));

vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
  useRegionsQuery: queryMocks.useRegionsQuery.mockReturnValue({ data: [] }),
}));

vi.mock('./useBlockStorageFetchOptions', () => ({
  ...vi.importActual('./useBlockStorageFetchOptions'),
  useBlockStorageFetchOptions: queryMocks.useBlockStorageFetchOptions,
}));

describe('<BlockStorageDimensionFilterAutocomplete />', () => {
  const defaultProps: DimensionFilterAutocompleteProps = {
    name: 'dimension-filter',
    dimensionLabel: 'linode_id',
    disabled: false,
    errorText: undefined,
    fieldOnBlur: vi.fn(),
    fieldOnChange: vi.fn(),
    fieldValue: null,
    multiple: false,
    placeholderText: 'Select a Value',
    entities: [],
    scope: null,
    selectedRegions: null,
    serviceType: 'blockstorage',
    type: 'alerts',
    values: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with correct label and placeholder', () => {
    queryMocks.useBlockStorageFetchOptions.mockReturnValue({
      values: [
        { label: 'Linode-1', value: '1' },
        { label: 'Linode-2', value: '2' },
      ],
      isLoading: false,
      isError: false,
    });
    renderWithTheme(
      <BlockStorageDimensionFilterAutocomplete {...defaultProps} />
    );
    expect(screen.getByLabelText(/Value/i)).toBeVisible();
    expect(screen.getByPlaceholderText('Select a Value')).toBeVisible();
  });

  it('calls fieldOnBlur when input is blurred', async () => {
    queryMocks.useBlockStorageFetchOptions.mockReturnValue({
      values: [
        { label: 'Linode-1', value: '1' },
        { label: 'Linode-2', value: '2' },
      ],
      isLoading: false,
      isError: false,
    });
    const user = userEvent.setup();
    renderWithTheme(
      <BlockStorageDimensionFilterAutocomplete {...defaultProps} />
    );
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.tab();
    expect(defaultProps.fieldOnBlur).toHaveBeenCalled();
  });

  it('disables the Autocomplete when disabled is true', () => {
    queryMocks.useBlockStorageFetchOptions.mockReturnValue({
      values: [],
      isLoading: false,
      isError: false,
    });
    renderWithTheme(
      <BlockStorageDimensionFilterAutocomplete {...defaultProps} disabled />
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('renders error text from props', () => {
    queryMocks.useBlockStorageFetchOptions.mockReturnValue({
      values: [],
      isLoading: false,
      isError: false,
    });
    renderWithTheme(
      <BlockStorageDimensionFilterAutocomplete
        {...defaultProps}
        errorText="Custom error"
      />
    );
    expect(screen.getByText('Custom error')).toBeVisible();
  });

  it('renders API error text when isError is true', async () => {
    queryMocks.useBlockStorageFetchOptions.mockReturnValue({
      values: [],
      isLoading: false,
      isError: true,
    });
    renderWithTheme(
      <BlockStorageDimensionFilterAutocomplete {...defaultProps} />
    );
    expect(
      await screen.findByText('Failed to fetch the values.')
    ).toBeVisible();
  });

  it('shows loading state when fetching values', () => {
    queryMocks.useBlockStorageFetchOptions.mockReturnValue({
      values: [],
      isLoading: true,
      isError: false,
    });
    renderWithTheme(
      <BlockStorageDimensionFilterAutocomplete {...defaultProps} />
    );
    expect(screen.getByTestId('circle-progress')).toBeVisible();
  });

  it('calls fieldOnChange with correct value when selecting an option (single)', async () => {
    queryMocks.useBlockStorageFetchOptions.mockReturnValue({
      values: [{ label: 'Linode-1', value: '1' }],
      isLoading: false,
      isError: false,
    });
    const user = userEvent.setup();
    const fieldOnChange = vi.fn();
    renderWithTheme(
      <BlockStorageDimensionFilterAutocomplete
        {...defaultProps}
        fieldOnChange={fieldOnChange}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('option', { name: /Linode-1/ }));
    expect(fieldOnChange).toHaveBeenCalledWith('1');
  });

  it('calls fieldOnChange with multiple values when multiple=true', async () => {
    queryMocks.useBlockStorageFetchOptions.mockReturnValue({
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
      <BlockStorageDimensionFilterAutocomplete
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
      <BlockStorageDimensionFilterAutocomplete
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

  it('does not call fieldOnChange when typing with no options', async () => {
    queryMocks.useBlockStorageFetchOptions.mockReturnValue({
      values: [],
      isLoading: false,
      isError: false,
    });
    renderWithTheme(
      <BlockStorageDimensionFilterAutocomplete {...defaultProps} />
    );
    const user = userEvent.setup();
    await user.type(screen.getByRole('combobox'), 'test');
    expect(defaultProps.fieldOnChange).not.toHaveBeenCalled();
  });

  it('cleans up invalid single value (string)', async () => {
    queryMocks.useBlockStorageFetchOptions.mockReturnValue({
      values: [{ label: 'Linode-1', value: '1' }],
      isLoading: false,
      isError: false,
    });
    const fieldOnChange = vi.fn();
    const { rerender } = renderWithTheme(
      <BlockStorageDimensionFilterAutocomplete
        {...defaultProps}
        fieldOnChange={fieldOnChange}
        fieldValue="invalid"
        multiple={false}
      />
    );
    // Simulate update to trigger effect
    queryMocks.useBlockStorageFetchOptions.mockReturnValue({
      values: [{ label: 'Linode-1', value: '1' }],
      isLoading: false,
      isError: false,
    });
    rerender(
      <BlockStorageDimensionFilterAutocomplete
        {...defaultProps}
        fieldOnChange={fieldOnChange}
        fieldValue="invalid"
        multiple={false}
      />
    );
    await waitFor(() => {
      expect(fieldOnChange).toHaveBeenCalledWith(null);
    });
  });

  it('cleans up invalid multi value (comma-separated string)', async () => {
    queryMocks.useBlockStorageFetchOptions.mockReturnValue({
      values: [
        { label: 'Linode-1', value: '1' },
        { label: 'Linode-2', value: '2' },
      ],
      isLoading: false,
      isError: false,
    });
    const fieldOnChange = vi.fn();
    const { rerender } = renderWithTheme(
      <BlockStorageDimensionFilterAutocomplete
        {...defaultProps}
        fieldOnChange={fieldOnChange}
        fieldValue="1,3,2"
        multiple={true}
      />
    );
    queryMocks.useBlockStorageFetchOptions.mockReturnValue({
      values: [
        { label: 'Linode-1', value: '1' },
        { label: 'Linode-2', value: '2' },
      ],
      isLoading: false,
      isError: false,
    });
    rerender(
      <BlockStorageDimensionFilterAutocomplete
        {...defaultProps}
        fieldOnChange={fieldOnChange}
        fieldValue="1,3,2"
        multiple={true}
      />
    );
    await waitFor(() => {
      expect(fieldOnChange).toHaveBeenCalledWith('1,2');
    });
  });

  it('cleans up all invalid multi values (comma-separated string)', async () => {
    queryMocks.useBlockStorageFetchOptions.mockReturnValue({
      values: [
        { label: 'Linode-1', value: '1' },
        { label: 'Linode-2', value: '2' },
      ],
      isLoading: false,
      isError: false,
    });
    const fieldOnChange = vi.fn();
    const { rerender } = renderWithTheme(
      <BlockStorageDimensionFilterAutocomplete
        {...defaultProps}
        fieldOnChange={fieldOnChange}
        fieldValue="3,4"
        multiple={true}
      />
    );
    queryMocks.useBlockStorageFetchOptions.mockReturnValue({
      values: [
        { label: 'Linode-1', value: '1' },
        { label: 'Linode-2', value: '2' },
      ],
      isLoading: false,
      isError: false,
    });
    rerender(
      <BlockStorageDimensionFilterAutocomplete
        {...defaultProps}
        fieldOnChange={fieldOnChange}
        fieldValue="3,4"
        multiple={true}
      />
    );
    await waitFor(() => {
      expect(fieldOnChange).toHaveBeenCalledWith('');
    });
  });
});
