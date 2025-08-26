import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DimensionFilterAutocomplete } from './DimensionFilterAutocomplete';

import type { Item } from '../../../constants';

const mockOptions: Item<string, string>[] = [
  { label: 'TCP', value: 'tcp' },
  { label: 'UDP', value: 'udp' },
];

describe('<DimensionFilterAutocomplete />', () => {
  const defaultProps = {
    name: `rule_criteria.rules.${0}.dimension_filters.%{0}.value`,
    disabled: false,
    errorText: '',
    fieldOnBlur: vi.fn(),
    fieldOnChange: vi.fn(),
    fieldValue: 'tcp',
    multiple: false,
    placeholderText: 'Select a value',
    values: mockOptions,
  };

  it('renders with label and placeholder', () => {
    renderWithTheme(<DimensionFilterAutocomplete {...defaultProps} />);
    expect(screen.getByLabelText(/Value/i)).toBeVisible();
    expect(screen.getByPlaceholderText('Select a value')).toBeVisible();
  });

  it('calls fieldOnBlur when input is blurred', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DimensionFilterAutocomplete {...defaultProps} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.tab(); // move focus away
    expect(defaultProps.fieldOnBlur).toHaveBeenCalled();
  });

  it('disables the Autocomplete when disabled is true', () => {
    renderWithTheme(<DimensionFilterAutocomplete {...defaultProps} disabled />);
    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
  });

  it('renders error text when provided', () => {
    renderWithTheme(
      <DimensionFilterAutocomplete
        {...defaultProps}
        errorText="Invalid protocol"
      />
    );
    expect(screen.getByText('Invalid protocol')).toBeVisible();
  });

  it('calls fieldOnChange with correct value when selecting TCP (single)', async () => {
    const user = userEvent.setup();
    const fieldOnChange = vi.fn();
    renderWithTheme(
      <DimensionFilterAutocomplete
        {...defaultProps}
        fieldOnChange={fieldOnChange}
        fieldValue={null}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(
      screen.getByRole('option', { name: mockOptions[0].label })
    ).toBeVisible();
    await user.click(
      screen.getByRole('option', { name: mockOptions[0].label })
    );
    expect(fieldOnChange).toHaveBeenCalledWith(mockOptions[0].value);
  });

  it('should select multiple options when multiple prop is true', async () => {
    const user = userEvent.setup();
    const fieldOnChange = vi.fn();
    const { rerender } = renderWithTheme(
      <DimensionFilterAutocomplete
        {...defaultProps}
        fieldOnChange={fieldOnChange}
        fieldValue={null}
        multiple
      />
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(
      screen.getByRole('option', { name: mockOptions[1].label })
    ).toBeVisible();
    await user.click(
      screen.getByRole('option', { name: mockOptions[1].label })
    );
    expect(fieldOnChange).toHaveBeenCalledWith(mockOptions[1].value);

    // Rerender with updated form state
    rerender(
      <DimensionFilterAutocomplete
        {...defaultProps}
        fieldOnChange={fieldOnChange}
        fieldValue={fieldOnChange.mock.calls[0][0]} // simulate form state update
        multiple
      />
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(
      screen.getByRole('option', { name: mockOptions[0].label })
    ).toBeVisible();
    await user.click(
      screen.getByRole('option', { name: mockOptions[0].label })
    );

    // Assert both values were selected
    expect(fieldOnChange).toHaveBeenCalledWith(
      `${mockOptions[1].value},${mockOptions[0].value}`
    );
  });
});
