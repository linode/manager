import { linodeFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import { QueryClientWrapper, renderWithWrappers } from '../utilities/wrap';
import { LinodeSelect } from './LinodeSelect';

import type { Linode } from '@linode/api-v4';

const TEXTFIELD_ID = 'textfield-input';

describe('LinodeSelect', () => {
  test('should display custom no options message', async () => {
    const customNoOptionsMessage = 'Custom No Options Message';
    const options: Linode[] = []; // Assuming no options are available
    const onSelectionChange = vi.fn();

    const screen = renderWithWrappers(
      <LinodeSelect
        multiple={false}
        noOptionsMessage={customNoOptionsMessage} // Pass the custom message via prop
        onSelectionChange={onSelectionChange}
        options={options}
        value={null}
      />,
      [QueryClientWrapper()]
    );

    const input = screen.getByTestId(TEXTFIELD_ID);

    // Open the dropdown
    await userEvent.click(input);

    await waitFor(() => {
      // The custom no options message should be displayed when there are no options available
      expect(screen.getByText(customNoOptionsMessage)).toBeInTheDocument();
    });
  });

  test('should display default no options message', async () => {
    // Mock the props
    const option: Linode[] = []; // Assuming no options are available
    const onSelectionChange = vi.fn();

    const screen = renderWithWrappers(
      <LinodeSelect
        multiple={false}
        onSelectionChange={onSelectionChange}
        options={option}
        value={null}
      />,
      [QueryClientWrapper()]
    );

    // Open the dropdown
    const input = screen.getByTestId(TEXTFIELD_ID);
    await userEvent.click(input);

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

    const screen = renderWithWrappers(
      <LinodeSelect
        multiple={false}
        noOptionsMessage={customNoOptionsMessage}
        onSelectionChange={onSelectionChange}
        options={option}
        value={null}
      />,
      [QueryClientWrapper()]
    );

    const input = screen.getByTestId(TEXTFIELD_ID);

    // Open the dropdown
    await userEvent.click(input);

    await waitFor(() => {
      expect(screen.getByText(customNoOptionsMessage)).toBeInTheDocument();
    });
  });

  test('should display no options message when user input does not match an option', async () => {
    const customNoOptionsMessage = 'Custom No Options Message';
    const option = linodeFactory.build({ id: 1, label: 'Linode 1' });
    const onSelectionChange = vi.fn();

    const screen = renderWithWrappers(
      <LinodeSelect
        multiple={false}
        noOptionsMessage={customNoOptionsMessage}
        onSelectionChange={onSelectionChange}
        options={[option]}
        value={null}
      />,
      [QueryClientWrapper()]
    );

    const input = screen.getByTestId(TEXTFIELD_ID);

    await userEvent.type(input, 'Linode 2');

    await waitFor(() => {
      expect(screen.getByText(customNoOptionsMessage)).toBeInTheDocument();
    });
  });

  test('should not display no options message when user input matches an option', async () => {
    const customNoOptionsMessage = 'Custom No Options Message';
    const option = linodeFactory.build({ id: 1, label: 'Linode 1' });
    const onSelectionChange = vi.fn();

    const screen = renderWithWrappers(
      <LinodeSelect
        multiple={false}
        noOptionsMessage={customNoOptionsMessage}
        onSelectionChange={onSelectionChange}
        options={[option]}
        value={null}
      />,
      [QueryClientWrapper()]
    );

    const input = screen.getByTestId(TEXTFIELD_ID);

    // The custom no options message should not be displayed when user input matches an option
    await userEvent.type(input, 'Linode 1');

    await waitFor(() => {
      expect(
        screen.queryByText(customNoOptionsMessage)
      ).not.toBeInTheDocument();
    });
  });
});
