import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { AlertEntityGroupingSelect } from './AlertEntityGroupingSelect';

describe('AlertEntityGroupingSelect', () => {
  it('should render the component', () => {
    renderWithThemeAndHookFormContext({
      component: <AlertEntityGroupingSelect name="type" />,
    });

    expect(screen.getByTestId('entity-grouping')).toBeInTheDocument();
    expect(screen.getByLabelText('Entity Grouping')).toBeInTheDocument();
  });

  it('Select option from drop down', async () => {
    renderWithThemeAndHookFormContext({
      component: <AlertEntityGroupingSelect name="type" />,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(
      screen.getByRole('option', { name: 'Account Level' })
    );

    expect(screen.getByRole('combobox')).toHaveAttribute(
      'value',
      'Account Level'
    );
  });
});
