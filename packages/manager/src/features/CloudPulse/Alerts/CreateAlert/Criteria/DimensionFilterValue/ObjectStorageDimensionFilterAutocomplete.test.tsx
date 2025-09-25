import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { use } from 'react';
import { vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ObjectStorageDimensionFilterAutocomplete } from './ObjectStorageDimensionFilterAutocomplete';

vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
  useRegionsQuery: queryMocks.useRegionsQuery.mockReturnValue({ data: [] }),
}));

vi.mock('./useObjectStorageFetchOptions', () => ({
  ...vi.importActual('./useObjectStorageFetchOptions'),
  useObjectStorageFetchOptions: queryMocks.useObjectStorageFetchOptions,
}));

const queryMocks = vi.hoisted(() => ({
  useRegionsQuery: vi.fn(),
  useObjectStorageFetchOptions: vi.fn(),
}));

import type { DimensionFilterAutocompleteProps } from './constants';

describe('<ObjectStorageDimensionFilterAutocomplete />', () => {
  const defaultProps: DimensionFilterAutocompleteProps = {
    name: 'dimension-filter',
    dimensionLabel: 'endpoint',
    disabled: false,
    errorText: undefined,
    fieldOnBlur: vi.fn(),
    fieldOnChange: vi.fn(),
    fieldValue: null,
    multiple: false,
    placeholderText: 'Select endpoint',
    entities: ['bucket-1'],
    scope: 'entity',
    selectedRegions: ['us-east'],
    serviceType: 'objectstorage',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with options when values are provided', () => {
    queryMocks.useObjectStorageFetchOptions.mockReturnValue({
      values: [
        {
          label: 'us-east-1.linodeobjects.com',
          value: 'us-east-1.linodeobjects.com',
        },
        {
          label: 'us-west-1.linodeobjects.com',
          value: 'us-west-1.linodeobjects.com',
        },
      ],
      isLoading: false,
      isError: false,
    });

    renderWithTheme(
      <ObjectStorageDimensionFilterAutocomplete {...defaultProps} />
    );
    expect(screen.getByLabelText(/Value/i)).toBeVisible();
    expect(screen.getByPlaceholderText('Select endpoint')).toBeVisible();
  });

  it('calls fieldOnBlur when input is blurred', async () => {
    queryMocks.useObjectStorageFetchOptions.mockReturnValue({
      values: [],
      isLoading: false,
      isError: false,
    });

    const user = userEvent.setup();
    renderWithTheme(
      <ObjectStorageDimensionFilterAutocomplete {...defaultProps} />
    );
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.tab();
    expect(defaultProps.fieldOnBlur).toHaveBeenCalled();
  });

  it('disables the Autocomplete when disabled is true', () => {
    queryMocks.useObjectStorageFetchOptions.mockReturnValue({
      values: [],
      isLoading: false,
      isError: false,
    });

    renderWithTheme(
      <ObjectStorageDimensionFilterAutocomplete {...defaultProps} disabled />
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('renders error text from props', () => {
    queryMocks.useObjectStorageFetchOptions.mockReturnValue({
      values: [],
      isLoading: false,
      isError: false,
    });

    renderWithTheme(
      <ObjectStorageDimensionFilterAutocomplete
        {...defaultProps}
        errorText="Something went wrong"
      />
    );
    expect(screen.getByText('Something went wrong')).toBeVisible();
  });

  it('renders API error text when isError is true', async () => {
    queryMocks.useObjectStorageFetchOptions.mockReturnValue({
      values: [],
      isLoading: false,
      isError: true,
    });

    renderWithTheme(
      <ObjectStorageDimensionFilterAutocomplete {...defaultProps} />
    );
    expect(
      await screen.findByText('Failed to fetch Object Storage endpoints.')
    ).toBeVisible();
  });

  it('shows loading state when fetching values', () => {
    queryMocks.useObjectStorageFetchOptions.mockReturnValue({
      values: [],
      isLoading: true,
      isError: false,
    });

    renderWithTheme(
      <ObjectStorageDimensionFilterAutocomplete {...defaultProps} />
    );
    expect(screen.getByTestId('circle-progress')).toBeVisible();
  });

  it('calls fieldOnChange with correct value when selecting an option (single)', async () => {
    queryMocks.useObjectStorageFetchOptions.mockReturnValue({
      values: [
        {
          label: 'us-east-1.linodeobjects.com',
          value: 'us-east-1.linodeobjects.com',
        },
      ],
      isLoading: false,
      isError: false,
    });

    const user = userEvent.setup();
    const fieldOnChange = vi.fn();
    renderWithTheme(
      <ObjectStorageDimensionFilterAutocomplete
        {...defaultProps}
        fieldOnChange={fieldOnChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('option', { name: /us-east-1/ }));
    expect(fieldOnChange).toHaveBeenCalledWith('us-east-1.linodeobjects.com');
  });

  it('calls fieldOnChange with multiple values when multiple=true', async () => {
    queryMocks.useObjectStorageFetchOptions.mockReturnValue({
      values: [
        {
          label: 'us-east-1.linodeobjects.com',
          value: 'us-east-1.linodeobjects.com',
        },
        {
          label: 'us-west-1.linodeobjects.com',
          value: 'us-west-1.linodeobjects.com',
        },
      ],
      isLoading: false,
      isError: false,
    });

    const user = userEvent.setup();
    const fieldOnChange = vi.fn();

    const { rerender } = renderWithTheme(
      <ObjectStorageDimensionFilterAutocomplete
        {...defaultProps}
        fieldOnChange={fieldOnChange}
        fieldValue={null}
        multiple
      />
    );

    // Select first option
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('option', { name: /us-east-1/ }));
    expect(fieldOnChange).toHaveBeenCalledWith('us-east-1.linodeobjects.com');

    // Rerender with updated form state
    rerender(
      <ObjectStorageDimensionFilterAutocomplete
        {...defaultProps}
        fieldOnChange={fieldOnChange}
        fieldValue={fieldOnChange.mock.calls[0][0]}
        multiple
      />
    );

    // Select second option
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('option', { name: /us-west-1/ }));

    expect(fieldOnChange).toHaveBeenCalledWith(
      'us-east-1.linodeobjects.com,us-west-1.linodeobjects.com'
    );
  });
});
