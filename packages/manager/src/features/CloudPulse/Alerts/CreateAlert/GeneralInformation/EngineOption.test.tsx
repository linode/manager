import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { EngineOption } from './EngineOption';

describe('EngineOption component tests', () => {
  it('should render the component when resource type is dbaas', () => {
    const { getByLabelText, getByTestId } = renderWithThemeAndHookFormContext({
      component: <EngineOption name={'engine_type'} />,
    });
    expect(getByLabelText('Engine Option')).toBeInTheDocument();
    expect(getByTestId('engine-option')).toBeInTheDocument();
  });
  it('should render the options happy path', async () => {
    const user = userEvent.setup();
    renderWithThemeAndHookFormContext({
      component: <EngineOption name={'engine_type'} />,
    });
    user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByRole('option', { name: 'MySQL' }));
    expect(screen.getByRole('option', { name: 'PostgreSQL' }));
  });
  it('should be able to select an option', async () => {
    const user = userEvent.setup();
    renderWithThemeAndHookFormContext({
      component: <EngineOption name={'engine_type'} />,
    });
    user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(await screen.findByRole('option', { name: 'MySQL' }));
    expect(screen.getByRole('combobox')).toHaveAttribute('value', 'MySQL');
  });
});
