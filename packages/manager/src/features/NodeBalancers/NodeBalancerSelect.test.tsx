import { nodeBalancerFactory } from '@linode/utilities';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerSelect } from './NodeBalancerSelect';

import type { NodeBalancer } from '@linode/api-v4';

const fakeNodeBalancerData = nodeBalancerFactory.build({
  id: 1,
  label: 'metadata-test-region',
  region: 'eu-west',
});

const TEXTFIELD_ID = 'textfield-input';

describe('NodeBalancerSelect', () => {
  it('should render custom options using renderOption', async () => {
    // Create a mock renderOption function
    const mockRenderOption = (
      nodebalancer: NodeBalancer,
      selected: boolean
    ) => (
      <span data-testid={`custom-option-${nodebalancer.id}`}>
        {`${nodebalancer.label} - ${selected ? 'Selected' : 'Not Selected'}`}
      </span>
    );

    // Render the component with the custom renderOption function
    renderWithTheme(
      <NodeBalancerSelect
        multiple={false}
        onSelectionChange={vi.fn()} // Placeholder, as there's no callback
        options={[fakeNodeBalancerData]}
        renderOption={mockRenderOption}
        value={null}
      />
    );

    const input = screen.getByTestId(TEXTFIELD_ID);

    // Open the dropdown
    await userEvent.click(input);

    // Wait for the options to load (use some unique identifier for the options)
    await waitFor(() => {
      const customOption = screen.getByTestId('custom-option-1');
      expect(customOption).toBeInTheDocument();
      expect(customOption).toHaveTextContent(
        'metadata-test-region - Not Selected'
      );
    });
  });
  it('should display custom no options message if one is passed in', async () => {
    const customNoOptionsMessage = 'Custom No Options Message';
    const options: NodeBalancer[] = []; // Assuming no options are available
    const onSelectionChange = vi.fn();

    renderWithTheme(
      <NodeBalancerSelect
        multiple={false}
        noOptionsMessage={customNoOptionsMessage} // Pass the custom message via prop
        onSelectionChange={onSelectionChange}
        options={options}
        value={null}
      />
    );

    const input = screen.getByTestId(TEXTFIELD_ID);

    // Open the dropdown
    await userEvent.click(input);

    await waitFor(() => {
      // The custom no options message should be displayed when there are no options available
      expect(screen.getByText(customNoOptionsMessage)).toBeInTheDocument();
    });
  });

  it('should display default no options message if no custom message is passed', async () => {
    // Mock the props
    const option: NodeBalancer[] = []; // Assuming no options are available
    const onSelectionChange = vi.fn();

    renderWithTheme(
      <NodeBalancerSelect
        multiple={false}
        onSelectionChange={onSelectionChange}
        options={option}
        value={null}
      />
    );

    // Open the dropdown
    const input = screen.getByTestId(TEXTFIELD_ID);
    await userEvent.click(input);

    await waitFor(() => {
      // The default no options message should be displayed when noOptionsMessage prop is not provided
      expect(
        screen.getByText('No available NodeBalancers')
      ).toBeInTheDocument();
    });
  });

  it('should display no options message when user input does not match', async () => {
    // Mock the props
    const customNoOptionsMessage = 'Custom No Options Message';
    const option: NodeBalancer[] = []; // Assuming no options are available
    const onSelectionChange = vi.fn();

    renderWithTheme(
      <NodeBalancerSelect
        multiple={false}
        noOptionsMessage={customNoOptionsMessage}
        onSelectionChange={onSelectionChange}
        options={option}
        value={null}
      />
    );

    const input = screen.getByTestId(TEXTFIELD_ID);

    // Open the dropdown
    await userEvent.click(input);

    await waitFor(() => {
      expect(screen.getByText(customNoOptionsMessage)).toBeInTheDocument();
    });
  });

  it('should display no options message when user input does not match an option', async () => {
    const customNoOptionsMessage = 'Custom No Options Message';
    const option = nodeBalancerFactory.build({
      id: 1,
      label: 'NodeBalancer 1',
    });
    const onSelectionChange = vi.fn();

    renderWithTheme(
      <NodeBalancerSelect
        multiple={false}
        noOptionsMessage={customNoOptionsMessage}
        onSelectionChange={onSelectionChange}
        options={[option]}
        value={null}
      />
    );

    const input = screen.getByTestId(TEXTFIELD_ID);

    await userEvent.type(input, 'NodeBalancer 2');

    await waitFor(() => {
      expect(screen.getByText(customNoOptionsMessage)).toBeInTheDocument();
    });
  });

  it('should not display no options message when user input matches an option', async () => {
    const customNoOptionsMessage = 'Custom No Options Message';
    const option = nodeBalancerFactory.build({
      id: 1,
      label: 'NodeBalancer 1',
    });
    const onSelectionChange = vi.fn();

    renderWithTheme(
      <NodeBalancerSelect
        multiple={false}
        noOptionsMessage={customNoOptionsMessage}
        onSelectionChange={onSelectionChange}
        options={[option]}
        value={null}
      />
    );

    const input = screen.getByTestId(TEXTFIELD_ID);

    // The custom no options message should not be displayed when user input matches an option
    await userEvent.type(input, 'NodeBalancer 1');

    await waitFor(() => {
      expect(
        screen.queryByText(customNoOptionsMessage)
      ).not.toBeInTheDocument();
    });
  });
});
