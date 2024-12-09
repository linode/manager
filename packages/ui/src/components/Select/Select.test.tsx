import { screen, waitFor, within } from '@testing-library/dom';
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
  it('It renders a Select with a label and options', async () => {
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

      const listbox = document.querySelector('[role="listbox"]');
      const optionElement = within(listbox as HTMLElement).getByText(
        option.label
      );
      fireEvent.click(optionElement);

      expect(onChange).toHaveBeenCalledWith(expect.any(Object), option);
      expect(selectInput).toHaveValue(option.label);
    });
  });

  it('can be clearable', async () => {
    const onChange = vi.fn();
    const { getByRole } = renderWithTheme(
      <Select
        clearable
        label="My Select"
        onChange={onChange}
        options={options}
      />
    );

    const selectInput = getByRole('combobox');
    fireEvent.mouseDown(selectInput);

    const listbox = screen.getByRole('listbox');
    const optionElement = within(listbox).getByText(options[0].label);
    fireEvent.click(optionElement);

    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: 'Clear' });
      expect(clearButton).toBeInTheDocument();
      fireEvent.click(clearButton);
      expect(onChange).toHaveBeenCalledWith(expect.any(Object), null);
    });
  });
});
