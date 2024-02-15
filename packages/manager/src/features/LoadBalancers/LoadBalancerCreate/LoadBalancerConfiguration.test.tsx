import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndFormik } from 'src/utilities/testHelpers';

import { LoadBalancerConfiguration } from './LoadBalancerConfiguration';
import {
  LoadBalancerCreateFormData,
  initialValues,
} from './LoadBalancerCreateFormWrapper';

import type { Handlers } from './LoadBalancerConfigurations';

export const handlers: Handlers = {
  handleAddRoute: vi.fn(),
  handleAddRule: vi.fn(),
  handleAddServiceTarget: vi.fn(),
  handleCloseRuleDrawer: vi.fn(),
  handleCloseServiceTargetDrawer: vi.fn(),
  handleEditRoute: vi.fn(),
  handleEditRule: vi.fn(),
  handleEditServiceTarget: vi.fn(),
};

describe('LoadBalancerConfiguration', () => {
  test('Should render Details content', async () => {
    renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <LoadBalancerConfiguration handlers={handlers} index={0} />,
      { initialValues, onSubmit: vi.fn() }
    );

    const ConfigurationInputLabel = screen.getByPlaceholderText(
      'Enter Configuration Label'
    );
    const ConfigurationPort = screen.getByPlaceholderText('Enter Port');

    await userEvent.type(ConfigurationInputLabel, 'Test Label');
    // Clear the input field before typing
    await userEvent.clear(ConfigurationPort);
    await userEvent.type(ConfigurationPort, '90');

    expect(ConfigurationInputLabel).toHaveValue('Test Label');
    expect(ConfigurationPort).toHaveValue(90);

    expect(screen.getByText('Protocol')).toBeInTheDocument();
    expect(screen.getByText('Next: Service Targets')).toBeInTheDocument();
    expect(screen.queryByText('Previous: Details')).toBeNull();
  });
  test('Should navigate to Service Targets content', async () => {
    renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <LoadBalancerConfiguration handlers={handlers} index={0} />,
      { initialValues, onSubmit: vi.fn() }
    );
    await userEvent.click(screen.getByTestId('service-targets'));
    expect(screen.getByText('Add Service Target')).toBeInTheDocument();
    expect(screen.getByText('Next: Routes')).toBeInTheDocument();
    expect(screen.getByText('Previous: Details')).toBeInTheDocument();
    expect(screen.queryByText('Previous: Service Targets')).toBeNull();
  });
  test('Should navigate to Routes content', async () => {
    renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <LoadBalancerConfiguration index={0} handlers={handlers} />,
      { initialValues, onSubmit: vi.fn() }
    );
    await userEvent.click(screen.getByTestId('service-targets'));
    await userEvent.click(screen.getByTestId('routes'));
    expect(screen.getByText('Routes', { selector: 'h2' })).toBeVisible();
    expect(screen.getByText('Previous: Service Targets')).toBeInTheDocument();
  });
  test('Should be able to go previous step', async () => {
    renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <LoadBalancerConfiguration index={0} handlers={handlers} />,
      { initialValues, onSubmit: vi.fn() }
    );
    await userEvent.click(screen.getByTestId('service-targets'));
    await userEvent.click(screen.getByText('Previous: Details'));
    expect(screen.getByText('Protocol')).toBeInTheDocument();
  });
});
