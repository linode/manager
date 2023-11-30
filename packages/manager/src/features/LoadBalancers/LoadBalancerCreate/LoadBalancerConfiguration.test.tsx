import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndFormik } from 'src/utilities/testHelpers';

import { LoadBalancerConfiguration } from './LoadBalancerConfiguration';

// Define your initial values based on your form structure
const initialValues = {
  configurations: [{ label: '', port: 80, protocol: 'https' }],
  label: '',
};

describe('LoadBalancerConfiguration', () => {
  test('Should render Details content', () => {
    renderWithThemeAndFormik(
      <LoadBalancerConfiguration index={0} name="configurations" />,
      { initialValues, onSubmit: () => {} }
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
    expect(ConfigurationPort).toHaveValue('90');

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
    renderWithThemeAndFormik(
      <LoadBalancerConfiguration index={0} name="configurations" />,
      { initialValues, onSubmit: () => {} }
    );
    userEvent.click(screen.getByTestId('service-targets'));
    expect(
      screen.getByText('TODO: AGLB - Implement Service Targets Configuration.')
    ).toBeInTheDocument();
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
    renderWithThemeAndFormik(
      <LoadBalancerConfiguration index={0} name="configurations" />,
      { initialValues, onSubmit: () => {} }
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
    renderWithThemeAndFormik(
      <LoadBalancerConfiguration index={0} name="configurations" />,
      { initialValues, onSubmit: () => {} }
    );
    userEvent.click(screen.getByTestId('service-targets'));
    userEvent.click(screen.getByText('Previous: Details'));
    expect(screen.getByText('Protocol')).toBeInTheDocument();
  });
});
