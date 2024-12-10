import { fireEvent } from '@testing-library/react';
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
      <Select label="My Select" onChange={onChange} options={options} />
    );

    expect(getByText('My Select')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Open' })).toBeInTheDocument();

    const selectInput = getByRole('combobox');

    options.forEach((option) => {
      fireEvent.focus(selectInput);
      fireEvent.change(selectInput, { target: { value: option.label } });

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
    const { container } = renderWithTheme(
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

    const clearButton = container.querySelector(
      '.MuiAutocomplete-clearIndicator'
    );
    expect(clearButton).toBeInTheDocument();
    fireEvent.click(clearButton!);
    expect(onChange).toHaveBeenCalledWith(expect.any(Object), null);
  });
});
