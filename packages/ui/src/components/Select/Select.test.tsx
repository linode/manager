import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithTheme } from '../../utilities/testHelpers';
import { Select } from './Select';

const options = [
  { label: 'Option 1', value: 'option-1' },
  { label: 'Option 2', value: 'option-2' },
  { label: 'Option 3', value: 'option-3' },
];

describe('Select', () => {
  it('renders a Select with a label and options', async () => {
    const onChange = vi.fn();
    const { getByRole, getByText } = renderWithTheme(
      <Select
        label="My Select"
        onChange={onChange}
        options={options}
        placeholder="Select something!"
      />
    );

    const select = getByRole('combobox');
    expect(select).toHaveAttribute('aria-autocomplete', 'list');
    expect(select).toHaveAttribute('aria-expanded', 'false');
    expect(select).toHaveAttribute('placeholder', 'Select something!');
    expect(select).toHaveAttribute('readOnly');

    expect(getByText('My Select')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Open' })).toBeInTheDocument();

    const selectInput = getByRole('combobox');

    options.forEach(async (option) => {
      await userEvent.click(selectInput);
      await userEvent.type(selectInput, option.label);

      expect(getByText(option.label)).toBeInTheDocument();
      expect(selectInput).toHaveValue(option.label);
    });
  });

  it('can have its label visually hidden', async () => {
    const { container } = renderWithTheme(
      <Select hideLabel label="My Select" options={options} />
    );

    const label = container.querySelector(
      '[data-qa-textfield-label="My Select"]'
    );
    expect(label?.parentElement).toHaveClass('visually-hidden');
  });

  it('can be clearable', async () => {
    const onChange = vi.fn();
    const { container, getByRole } = renderWithTheme(
      <Select
        isOptionEqualToValue={(option, value) =>
          option.value === value.value && option.label === value.label
        }
        value={{
          label: options[0].label,
          value: options[0].value,
        }}
        clearable
        label="My Select"
        onChange={onChange}
        options={options}
      />
    );

    const select = getByRole('combobox');
    expect(select).toHaveValue(options[0].label);
    const clearButton = container.querySelector(
      '.MuiAutocomplete-clearIndicator'
    );
    expect(clearButton).toBeInTheDocument();
    await userEvent.click(clearButton!);
    expect(onChange).toHaveBeenCalledWith(expect.any(Object), null);
  });

  it('features helper text', () => {
    const { getByText } = renderWithTheme(
      <Select helperText="Helper text" label="My Select" options={options} />
    );
    expect(getByText('Helper text')).toBeInTheDocument();
  });

  it('features error text', () => {
    const { getByText } = renderWithTheme(
      <Select errorText="Error text" label="My Select" options={options} />
    );
    expect(getByText('Error text')).toBeInTheDocument();
  });

  it('features loading state', () => {
    const { getByRole } = renderWithTheme(
      <Select label="My Select" loading options={options} />
    );
    expect(
      getByRole('progressbar', { name: 'Content is loading' })
    ).toBeInTheDocument();
  });

  it('features a required state', () => {
    const { getByText } = renderWithTheme(
      <Select label="My Select" options={options} required />
    );
    expect(getByText('(required)')).toBeInTheDocument();
  });

  it('features a searchable state', () => {
    const { getByRole } = renderWithTheme(
      <Select label="My Select" options={options} searchable />
    );
    const select = getByRole('combobox');
    expect(select).not.toHaveAttribute('readOnly');
  });
});
