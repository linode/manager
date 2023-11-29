import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { LoadBalancerConfiguration } from './LoadBalancerConfiguration';

describe('LoadBalancerConfiguration', () => {
  test('Should render Details content', () => {
    renderWithTheme(<LoadBalancerConfiguration index={0} />);
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
    renderWithTheme(<LoadBalancerConfiguration index={0} />);
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
    renderWithTheme(<LoadBalancerConfiguration index={0} />);
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
    renderWithTheme(<LoadBalancerConfiguration index={0} />);
    userEvent.click(screen.getByTestId('service-targets'));
    userEvent.click(screen.getByText('Previous: Details'));
    expect(screen.getByText('Protocol')).toBeInTheDocument();
  });
});
