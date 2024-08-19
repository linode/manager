import { fireEvent, screen } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseServiceSelect } from './ServiceTypeSelect';

describe('ServiceTypeSelect component tests', () => {
  it('should render the Autocomplete component', () => {
    const { getAllByText, getByPlaceholderText, getByTestId } = renderWithTheme(
      <CloudPulseServiceSelect name={'serviceType'} />
    );
    expect(getByPlaceholderText('Select a service')).toBeInTheDocument();
    expect(getByTestId('servicetype-select')).toBeInTheDocument();
    getAllByText('Service');
  });

  it('should render service types happy path', (_) => {
    renderWithTheme(<CloudPulseServiceSelect name={'serviceType'} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(
      screen.getByRole('option', {
        name: 'Linodes',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', {
        name: 'DbaaS',
      })
    ).toBeInTheDocument();
  });
});