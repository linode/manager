import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateAlertDefinition } from './CreateAlertDefinition';
describe('AlertDefinition Create', () => {
  it('should render inputs', () => {
    const { getAllByText } = renderWithTheme(<CreateAlertDefinition />);

    getAllByText('Name');
    getAllByText('Description');
    getAllByText('Service');
    getAllByText('Region');
    getAllByText('Resources');
    getAllByText('Severity');
  });
});
