import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithTheme } from '../../utilities/testHelpers';
import { Autocomplete } from './Autocomplete';

// Mock the options for testing
const options = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
];

// Mock the selection change callback function for testing
const handleSelectionChange = vi.fn();

describe('Autocomplete Component', () => {
  it('renders with the correct label', () => {
    renderWithTheme(
      <Autocomplete
        label="Test Label"
        onChange={handleSelectionChange}
        options={options}
      />
    );

    const labelElement = screen.getByLabelText('Test Label');
    expect(labelElement).toBeInTheDocument();
  });

  it('calls the onSelectionChange callback when an option is selected', () => {
    renderWithTheme(
      <Autocomplete
        label="Test Label"
        onChange={handleSelectionChange}
        options={options}
      />
    );

    const inputElement = screen.getByRole('combobox');
    fireEvent.focus(inputElement);
    fireEvent.change(inputElement, { target: { value: 'Option 1' } });

    const optionElement = screen.getByText('Option 1');
    fireEvent.click(optionElement);

    const selectOption = handleSelectionChange.mock.calls[0][1];

    expect(selectOption).toEqual(options[0]);
  });

  it('displays the error message when errorText prop is provided', () => {
    const errorMessage = 'This field is required';

    renderWithTheme(
      <Autocomplete
        errorText={errorMessage}
        label="Test Label"
        onChange={handleSelectionChange}
        options={options}
      />
    );

    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
  });

  it('does not display the error message when errorText prop is not provided', () => {
    renderWithTheme(
      <Autocomplete
        label="Test Label"
        onChange={handleSelectionChange}
        options={options}
      />
    );

    const errorElement = screen.queryByText('This field is required');
    expect(errorElement).not.toBeInTheDocument();
  });

  describe('renders all no options messages', () => {
    it('displays the loading message when loading prop is true', () => {
      renderWithTheme(
        <Autocomplete
          label="Test Label"
          loading
          onChange={handleSelectionChange}
          options={[]}
        />
      );

      const inputElement = screen.getByRole('combobox');
      fireEvent.focus(inputElement);
      fireEvent.keyDown(inputElement, { key: 'ArrowDown' });

      const loadingMessage = screen.getByText('Loading...');
      expect(loadingMessage).toBeInTheDocument();
    });

    it('displays the no options message when options are empty', () => {
      renderWithTheme(
        <Autocomplete
          label="Test Label"
          onChange={handleSelectionChange}
          options={[]}
        />
      );

      const inputElement = screen.getByRole('combobox');
      fireEvent.focus(inputElement);
      fireEvent.keyDown(inputElement, { key: 'ArrowDown' });

      const noOptionsMessage = screen.getByText(
        'You have no options to choose from'
      );
      expect(noOptionsMessage).toBeInTheDocument();
    });
  });
});
