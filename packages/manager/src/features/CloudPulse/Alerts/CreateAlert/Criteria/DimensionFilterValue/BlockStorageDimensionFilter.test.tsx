import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { BlockStorageDimensionFilter } from './BlockStorageDimensionFilter';

import type { DimensionFilterAutocompleteProps } from './constants';

describe('<BlockStorageDimensionFilter />', () => {
  const defaultProps: DimensionFilterAutocompleteProps = {
    name: 'dimension-filter',
    dimensionLabel: 'linode_id',
    disabled: false,
    errorText: undefined,
    fieldOnBlur: vi.fn(),
    fieldOnChange: vi.fn(),
    fieldValue: null,
    multiple: false,
    placeholderText: 'Select a Linode',
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
    renderWithTheme(<BlockStorageDimensionFilter {...defaultProps} />);
    expect(screen.getByLabelText(/Value/i)).toBeVisible();
    expect(screen.getByPlaceholderText('Select a Linode')).toBeVisible();
  });

  it('calls fieldOnBlur when input is blurred', async () => {
    renderWithTheme(<BlockStorageDimensionFilter {...defaultProps} />);
    const user = userEvent.setup();
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.tab();
    expect(defaultProps.fieldOnBlur).toHaveBeenCalled();
  });

  it('disables the Autocomplete when disabled is true', () => {
    renderWithTheme(<BlockStorageDimensionFilter {...defaultProps} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('renders error text from props', () => {
    renderWithTheme(
      <BlockStorageDimensionFilter {...defaultProps} errorText="Custom error" />
    );
    expect(screen.getByText('Custom error')).toBeVisible();
  });

  it('does not call fieldOnChange when typing with no options', async () => {
    renderWithTheme(<BlockStorageDimensionFilter {...defaultProps} />);
    const user = userEvent.setup();
    await user.type(screen.getByRole('combobox'), 'test');
    expect(defaultProps.fieldOnChange).not.toHaveBeenCalled();
  });
});
