import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { AlertEntityScopeSelect } from './AlertEntityScopeSelect';

describe('AlertEntityGroupingSelect', () => {
  it('should render the component', () => {
    renderWithThemeAndHookFormContext({
      component: <AlertEntityScopeSelect name="group" />,
    });

    expect(screen.getByTestId('entity-grouping')).toBeInTheDocument();
    expect(screen.getByLabelText('Scope')).toBeInTheDocument();
  });

  it('Select option from drop down', async () => {
    renderWithThemeAndHookFormContext({
      component: <AlertEntityScopeSelect name="group" />,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(screen.getByRole('option', { name: 'Account' }));

    expect(screen.getByRole('combobox')).toHaveAttribute('value', 'Account');
  });
});
