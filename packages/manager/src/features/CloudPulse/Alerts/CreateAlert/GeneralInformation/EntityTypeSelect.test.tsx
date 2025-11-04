import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { EntityTypeSelect } from './EntityTypeSelect';

describe('EntityTypeSelect component tests', () => {
  it('should render the Autocomplete component', () => {
    const { getAllByText, getByTestId } = renderWithThemeAndHookFormContext({
      component: <EntityTypeSelect name="entity_type" />,
    });
    getByTestId('entity-type-select');
    getAllByText('Entity Type');
  });

  it('should render entity type options', async () => {
    renderWithThemeAndHookFormContext({
      component: <EntityTypeSelect name="entity_type" />,
    });
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(
      await screen.findByRole('option', {
        name: 'Linodes',
      })
    ).toBeVisible();
    expect(
      screen.getByRole('option', {
        name: 'NodeBalancers',
      })
    ).toBeVisible();
  });

  it('should be able to select an entity type', async () => {
    renderWithThemeAndHookFormContext({
      component: <EntityTypeSelect name="entity_type" />,
    });
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(
      await screen.findByRole('option', { name: 'Linodes' })
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('value', 'Linodes');
  });

  it('should call onEntityTypeChange when selection changes', async () => {
    const onEntityTypeChange = vi.fn();
    renderWithThemeAndHookFormContext({
      component: (
        <EntityTypeSelect
          name="entity_type"
          onEntityTypeChange={onEntityTypeChange}
        />
      ),
    });
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(
      await screen.findByRole('option', { name: 'NodeBalancers' })
    );
    expect(onEntityTypeChange).toHaveBeenCalled();
  });

  it('should clear the selection', async () => {
    renderWithThemeAndHookFormContext({
      component: <EntityTypeSelect name="entity_type" />,
    });
    const entityTypeDropdown = screen.getByTestId('entity-type-select');
    await userEvent.click(
      within(entityTypeDropdown).getByRole('button', { name: 'Open' })
    );
    await userEvent.click(
      await screen.findByRole('option', { name: 'Linodes' })
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('value', 'Linodes');

    await userEvent.click(
      within(entityTypeDropdown).getByRole('button', { name: 'Clear' })
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('value', '');
  });
});
