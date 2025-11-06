import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { EntityTypeSelect } from './EntityTypeSelect';

describe('EntityTypeSelect component tests', () => {
  const onEntityChange = vi.fn();
  it('should render the Autocomplete component', () => {
    const { getAllByText, getByTestId } = renderWithThemeAndHookFormContext({
      component: (
        <EntityTypeSelect
          name="entity_type"
          onEntityTypeChange={onEntityChange}
        />
      ),
    });
    getByTestId('entity-type-select');
    getAllByText('Entity Type');
  });

  it('should render entity type options', async () => {
    renderWithThemeAndHookFormContext({
      component: (
        <EntityTypeSelect
          name="entity_type"
          onEntityTypeChange={onEntityChange}
        />
      ),
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
      component: (
        <EntityTypeSelect
          name="entity_type"
          onEntityTypeChange={onEntityChange}
        />
      ),
    });
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(
      await screen.findByRole('option', { name: 'Linodes' })
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('value', 'Linodes');
  });

  it('should call onEntityTypeChange when selection changes', async () => {
    renderWithThemeAndHookFormContext({
      component: (
        <EntityTypeSelect
          name="entity_type"
          onEntityTypeChange={onEntityChange}
        />
      ),
    });
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(
      await screen.findByRole('option', { name: 'NodeBalancers' })
    );
    expect(onEntityChange).toHaveBeenCalled();
  });

  it('should clear the selection', async () => {
    renderWithThemeAndHookFormContext({
      component: (
        <EntityTypeSelect
          name="entity_type"
          onEntityTypeChange={onEntityChange}
        />
      ),
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
