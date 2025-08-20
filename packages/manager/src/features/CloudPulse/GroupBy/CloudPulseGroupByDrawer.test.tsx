import { screen, waitFor, within } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  CloudPulseGroupByDrawer,
  type GroupByDrawerProps,
} from './CloudPulseGroupByDrawer';

import type { GroupByOption } from './CloudPulseGroupByDrawer';

const onApply = vi.fn();
const onCancel = vi.fn();
const title = 'Global Group By';
const subtitle = 'Dashboard: Resource Usage';
const message = 'Group by different dimensions to analyze resource usage.';
const options: GroupByOption[] = Array.from({ length: 7 }, (_, index) => ({
  label: `Dimension ${index + 1}`,
  value: `dimension_${index + 1}`,
}));
const defaultValue = [options[0], options[2]];

const drawerProps: GroupByDrawerProps = {
  onApply,
  onCancel,
  title,
  subtitle,
  message,
  options,
  open: true,
  serviceType: 'linode',
};

describe('Cloud Pulse Group By Drawer Component', () => {
  it('should not open drawer', () => {
    renderWithTheme(<CloudPulseGroupByDrawer {...drawerProps} open={false} />);

    expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
    expect(screen.queryByText(title)).not.toBeInTheDocument();
    expect(screen.queryByText(subtitle)).not.toBeInTheDocument();
    expect(screen.queryByText(message)).not.toBeInTheDocument();
  });

  it('Should open and show title, message and subtitle', () => {
    renderWithTheme(<CloudPulseGroupByDrawer {...drawerProps} />);
    const drawer = screen.getByTestId('drawer');
    const titleElement = screen.getByText(title);
    const subtitleElement = screen.getByText(subtitle);
    const messageElement = screen.getByText(message);
    const applyButton = screen.getByTestId('apply');
    const cancelButton = screen.getByTestId('cancel');

    expect(drawer).toBeInTheDocument();
    expect(titleElement).toBeInTheDocument();
    expect(subtitleElement).toBeInTheDocument();
    expect(messageElement).toBeInTheDocument();
    expect(applyButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  it('Should have options and default values selected', async () => {
    renderWithTheme(
      <CloudPulseGroupByDrawer {...drawerProps} defaultValue={defaultValue} />
    );

    // Check if all the default values are selected when autocomplete is closed
    defaultValue.forEach((value) => {
      const option = screen.getByRole('button', { name: value.label });
      expect(option).toBeInTheDocument();
    });

    // Should have all the options
    await screen.getByRole('button', { name: 'Open' }).click();

    const optionsList = screen.getAllByRole('option');

    expect(optionsList).toHaveLength(options.length);
  });

  it('Should disable options after maximum limit', async () => {
    renderWithTheme(
      <CloudPulseGroupByDrawer
        {...drawerProps}
        defaultValue={[...defaultValue, options[1]]}
      />
    );

    await screen.getByRole('button', { name: 'Open' }).click();

    const disabledOption = screen.getByRole('option', {
      name: options[3].label,
    });

    expect(disabledOption).toHaveAttribute('aria-disabled', 'true');

    const enabledOption = screen.getByRole('option', {
      name: options[0].label,
    });

    expect(enabledOption).toHaveAttribute('aria-disabled', 'false');
  });

  it('Should revert the state on click of cancel button', async () => {
    renderWithTheme(
      <CloudPulseGroupByDrawer {...drawerProps} defaultValue={defaultValue} />
    );

    // Option currently not selected
    const newOption = options[1];

    // Option is not selected
    expect(
      screen.queryByRole('button', { name: newOption.label })
    ).not.toBeInTheDocument();

    await screen.getByRole('button', { name: 'Open' }).click();

    // select the option
    await screen.getByRole('option', { name: newOption.label }).click();

    await screen.getByRole('button', { name: 'Close' }).click();

    const element = screen.getByRole('button', { name: newOption.label });

    // Element is selected
    expect(element).toBeInTheDocument();

    // cancel button clicked

    await screen.getByTestId('cancel').click();

    // New selection is reverted
    expect(
      screen.queryByRole('button', { name: newOption.label })
    ).not.toBeInTheDocument();

    // Default values are still there
    defaultValue.forEach((value) => {
      const option = screen.getByRole('button', { name: value.label });
      expect(option).toBeInTheDocument();
    });
  });

  it('Should save the changes on apply button clicked', async () => {
    renderWithTheme(
      <CloudPulseGroupByDrawer {...drawerProps} defaultValue={defaultValue} />
    );

    // Option currently not selected
    const newOption = options[1];

    await screen.getByRole('button', { name: 'Open' }).click();

    // select the option
    await screen.getByRole('option', { name: newOption.label }).click();

    await screen.getByRole('button', { name: 'Close' }).click();

    const element = screen.getByRole('button', { name: newOption.label });

    // Element is selected
    expect(element).toBeInTheDocument();

    // cancel button clicked

    await screen.getByTestId('apply').click();

    expect(onApply).toHaveBeenCalledWith([...defaultValue, newOption]);
  });
});
