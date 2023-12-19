import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndFormik } from 'src/utilities/testHelpers';

import { LoadBalancerConfiguration } from './LoadBalancerConfiguration';
import { LoadBalancerCreateFormData } from './LoadBalancerCreate';

// Define your initial values based on your form structure
const initialValues: LoadBalancerCreateFormData = {
  configurations: [
    { certificates: [], label: '', port: 80, protocol: 'https' },
  ],
  label: '',
  regions: [],
  service_targets: [],
};

describe('LoadBalancerConfiguration', () => {
  test('Should render Details content', () => {
    renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <LoadBalancerConfiguration index={0} />,
      { initialValues, onSubmit: vi.fn() }
    );

    const ConfigurationInputLabel = screen.getByPlaceholderText(
      'Enter Configuration Label'
    );
    const ConfigurationPort = screen.getByPlaceholderText('Enter Port');

    userEvent.type(ConfigurationInputLabel, 'Test Label');
    // Clear the input field before typing
    userEvent.clear(ConfigurationPort);
    userEvent.type(ConfigurationPort, '90');

    expect(ConfigurationInputLabel).toHaveValue('Test Label');
    expect(ConfigurationPort).toHaveValue(90);

    expect(screen.getByText('Protocol')).toBeInTheDocument();
    expect(
      screen.queryByText(
        'TODO: AGLB - Implement Service Targets Configuration.'
      )
    ).toBeNull();
    expect(
      screen.queryByText('TODO: AGLB - Implement Routes Configuration.')
    ).toBeNull();
    expect(screen.getByText('Next: Service Targets')).toBeInTheDocument();
    expect(screen.queryByText('Previous: Details')).toBeNull();
  });
  test('Should navigate to Service Targets content', () => {
    renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <LoadBalancerConfiguration index={0} />,
      { initialValues, onSubmit: vi.fn() }
    );
    userEvent.click(screen.getByTestId('service-targets'));
    expect(screen.getByText('Add Service Target')).toBeInTheDocument();
    expect(
      screen.queryByText('TODO: AGLB - Implement Details step content.')
    ).toBeNull();
    expect(
      screen.queryByText('TODO: AGLB - Implement Routes Configuration.')
    ).toBeNull();
    expect(screen.getByText('Next: Routes')).toBeInTheDocument();
    expect(screen.getByText('Previous: Details')).toBeInTheDocument();
    expect(screen.queryByText('Previous: Service Targets')).toBeNull();
  });
  test('Should navigate to Routes content', () => {
    renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <LoadBalancerConfiguration index={0} />,
      { initialValues, onSubmit: vi.fn() }
    );
    userEvent.click(screen.getByTestId('service-targets'));
    userEvent.click(screen.getByTestId('routes'));
    expect(
      screen.queryByText('TODO: AGLB - Implement Details step content.')
    ).toBeNull();
    expect(
      screen.queryByText(
        'TODO: AGLB - Implement Service Targets Configuration.'
      )
    ).toBeNull();
    expect(
      screen.getByText('TODO: AGLB - Implement Routes Configuration.')
    ).toBeInTheDocument();
    expect(screen.getByText('Previous: Service Targets')).toBeInTheDocument();
  });
  test('Should be able to go previous step', () => {
    renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <LoadBalancerConfiguration index={0} />,
      { initialValues, onSubmit: vi.fn() }
    );
    userEvent.click(screen.getByTestId('service-targets'));
    userEvent.click(screen.getByText('Previous: Details'));
    expect(screen.getByText('Protocol')).toBeInTheDocument();
  });
});
