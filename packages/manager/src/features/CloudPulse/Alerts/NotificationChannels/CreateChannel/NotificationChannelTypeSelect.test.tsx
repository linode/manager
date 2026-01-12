import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { channelTypeOptions } from '../../constants';
import { NotificationChannelTypeSelect } from './NotificationChannelTypeSelect';

import type { NotificationChannelTypeSelectProps } from './NotificationChannelTypeSelect';

const mockHandleChannelTypeChange = vi.fn();
const mockOnBlur = vi.fn();

const props: NotificationChannelTypeSelectProps = {
  handleChannelTypeChange: mockHandleChannelTypeChange,
  onBlur: mockOnBlur,
  options: channelTypeOptions,
  value: null,
};

describe('NotificationChannelTypeSelect component tests', () => {
  it('should render the Autocomplete component', () => {
    renderWithTheme(<NotificationChannelTypeSelect {...props} />);

    expect(screen.getByTestId('channel-type-select')).toBeVisible();
    expect(screen.getByText('Type')).toBeVisible();
    expect(screen.getByPlaceholderText('Select a Channel Type')).toBeVisible();
  });

  it('should render channel type options when opened and able to select an option', async () => {
    renderWithTheme(<NotificationChannelTypeSelect {...props} />);

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByRole('option', { name: 'Email' })).toBeVisible();

    // select the email option
    await userEvent.click(await screen.findByRole('option', { name: 'Email' }));
    expect(screen.getByRole('combobox')).toHaveAttribute('value', 'Email');

    // verify handleChannelTypeChange is called with the correct value
    expect(mockHandleChannelTypeChange).toHaveBeenCalledWith('email');
  });

  it('should be able to clear the selected channel type', async () => {
    renderWithTheme(<NotificationChannelTypeSelect {...props} value="email" />);

    // Verify initial value is set
    expect(screen.getByRole('combobox')).toHaveAttribute('value', 'Email');

    // Click the clear button
    const clearButton = screen.getByLabelText('Clear');
    await userEvent.click(clearButton);

    // verify handleChannelTypeChange is called with null
    expect(screen.getByRole('combobox')).toHaveAttribute('value', '');
    expect(mockHandleChannelTypeChange).toHaveBeenCalledWith(null);
  });

  it('should display error message when error prop is provided', () => {
    const errorMessage = 'This field is required';

    renderWithTheme(
      <NotificationChannelTypeSelect {...props} error={errorMessage} />
    );

    expect(screen.getByText(errorMessage)).toBeVisible();
  });

  it('should call onBlur when the field loses focus', async () => {
    renderWithTheme(<NotificationChannelTypeSelect {...props} />);

    const combobox = screen.getByRole('combobox');
    await userEvent.click(combobox);
    await userEvent.tab();

    expect(mockOnBlur).toHaveBeenCalled();
  });

  it('should handle empty options array', async () => {
    renderWithTheme(<NotificationChannelTypeSelect {...props} options={[]} />);

    expect(screen.getByTestId('channel-type-select')).toBeVisible();
    expect(screen.getByPlaceholderText('Select a Channel Type')).toBeVisible();

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(
      screen.getByText('You have no options to choose from')
    ).toBeVisible();
  });

  it('should render with null value', async () => {
    renderWithTheme(<NotificationChannelTypeSelect {...props} value={null} />);

    expect(screen.getByRole('combobox')).toHaveAttribute('value', '');
  });
});
