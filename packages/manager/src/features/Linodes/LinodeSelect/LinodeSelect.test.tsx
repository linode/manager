import { Linode } from '@linode/api-v4';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { linodeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeSelect } from './LinodeSelect';

const fakeLinodeData = linodeFactory.build({
  id: 1,
  image: 'metadata-test-image',
  label: 'metadata-test-region',
  region: 'eu-west',
});

const TEXTFIELD_ID = 'textfield-input';

describe('LinodeSelect', () => {
  test('renders custom options using renderOption', async () => {
    // Create a mock renderOption function
    const mockRenderOption = (linode: Linode, selected: boolean) => (
      <span data-testid={`custom-option-${linode.id}`}>
        {`${linode.label} - ${selected ? 'Selected' : 'Not Selected'}`}
      </span>
    );

    // Render the component with the custom renderOption function
    renderWithTheme(
      <LinodeSelect
        multiple={false}
        onSelectionChange={vi.fn()} // Placeholder, as there's no callback
        options={[fakeLinodeData]}
        renderOption={mockRenderOption}
        value={null}
      />
    );

    const input = screen.getByTestId(TEXTFIELD_ID);

    // Open the dropdown
    userEvent.click(input);

    // Wait for the options to load (use some unique identifier for the options)
    await waitFor(() => {
      const customOption = screen.getByTestId('custom-option-1');
      expect(customOption).toBeInTheDocument();
      expect(customOption).toHaveTextContent(
        'metadata-test-region - Not Selected'
      );
    });
  });
  test('should display custom no options message', async () => {
    const customNoOptionsMessage = 'Custom No Options Message';
    const options: Linode[] = []; // Assuming no options are available
    const onSelectionChange = vi.fn();

    renderWithTheme(
      <LinodeSelect
        multiple={false}
        noOptionsMessage={customNoOptionsMessage} // Pass the custom message via prop
        onSelectionChange={onSelectionChange}
        options={options}
        value={null}
      />
    );

    const input = screen.getByTestId(TEXTFIELD_ID);

    // Open the dropdown
    userEvent.click(input);

    await waitFor(() => {
      // The custom no options message should be displayed when there are no options available
      expect(screen.getByText(customNoOptionsMessage)).toBeInTheDocument();
    });
  });

  test('should display default no options message', async () => {
    // Mock the props
    const option: Linode[] = []; // Assuming no options are available
    const onSelectionChange = vi.fn();

    renderWithTheme(
      <LinodeSelect
        multiple={false}
        onSelectionChange={onSelectionChange}
        options={option}
        value={null}
      />
    );

    // Open the dropdown
    const input = screen.getByTestId(TEXTFIELD_ID);
    userEvent.click(input);

    await waitFor(() => {
      // The default no options message should be displayed when noOptionsMessage prop is not provided
      expect(screen.getByText('No available Linodes')).toBeInTheDocument();
    });
  });

  test('should display no options message when user input does not match', async () => {
    // Mock the props
    const customNoOptionsMessage = 'Custom No Options Message';
    const option: Linode[] = []; // Assuming no options are available
    const onSelectionChange = vi.fn();

    renderWithTheme(
      <LinodeSelect
        multiple={false}
        noOptionsMessage={customNoOptionsMessage}
        onSelectionChange={onSelectionChange}
        options={option}
        value={null}
      />
    );

    const input = screen.getByTestId(TEXTFIELD_ID);

    // Open the dropdown
    userEvent.click(input);

    await waitFor(() => {
      expect(screen.getByText(customNoOptionsMessage)).toBeInTheDocument();
    });
  });

  test('should display no options message when user input does not match an option', async () => {
    const customNoOptionsMessage = 'Custom No Options Message';
    const option = linodeFactory.build({ id: 1, label: 'Linode 1' });
    const onSelectionChange = vi.fn();

    renderWithTheme(
      <LinodeSelect
        multiple={false}
        noOptionsMessage={customNoOptionsMessage}
        onSelectionChange={onSelectionChange}
        options={[option]}
        value={null}
      />
    );

    const input = screen.getByTestId(TEXTFIELD_ID);

    userEvent.type(input, 'Linode 2');

    await waitFor(() => {
      expect(screen.getByText(customNoOptionsMessage)).toBeInTheDocument();
    });
  });

  test('should not display no options message when user input matches an option', async () => {
    const customNoOptionsMessage = 'Custom No Options Message';
    const option = linodeFactory.build({ id: 1, label: 'Linode 1' });
    const onSelectionChange = vi.fn();

    renderWithTheme(
      <LinodeSelect
        multiple={false}
        noOptionsMessage={customNoOptionsMessage}
        onSelectionChange={onSelectionChange}
        options={[option]}
        value={null}
      />
    );

    const input = screen.getByTestId(TEXTFIELD_ID);

    // The custom no options message should not be displayed when user input matches an option
    userEvent.type(input, 'Linode 1');

    await waitFor(() => {
      expect(
        screen.queryByText(customNoOptionsMessage)
      ).not.toBeInTheDocument();
    });
  });
});
