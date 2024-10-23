import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateAlertDefinition } from './CreateAlertDefinition';
describe('AlertDefinition Create', () => {
  it('should render inputs', () => {
    const { getByLabelText } = renderWithTheme(<CreateAlertDefinition />);

    expect(getByLabelText('Name')).toBeVisible();
    expect(getByLabelText('Description (optional)')).toBeVisible();
    expect(getByLabelText('Severity')).toBeVisible();
  });
});
