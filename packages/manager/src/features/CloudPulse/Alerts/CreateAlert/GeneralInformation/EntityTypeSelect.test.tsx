import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { entityTypeTooltipText } from '../../constants';
import { EntityTypeSelect } from './EntityTypeSelect';

describe('EntityTypeSelect component tests', () => {
  const onEntityChange = vi.fn();
  const ENTITY_TYPE_SELECT_TEST_ID = 'entity-type-select';

  it('should render the Autocomplete component', () => {
    const { getAllByText, getByTestId } = renderWithThemeAndHookFormContext({
      component: (
        <EntityTypeSelect
          name="entity_type"
          onEntityTypeChange={onEntityChange}
        />
      ),
    });
    getByTestId(ENTITY_TYPE_SELECT_TEST_ID);
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

  it('should not have a clear button since disableClearable is true', () => {
    renderWithThemeAndHookFormContext({
      component: (
        <EntityTypeSelect
          name="entity_type"
          onEntityTypeChange={onEntityChange}
        />
      ),
      useFormOptions: {
        defaultValues: {
          entity_type: 'linode',
        },
      },
    });
    const entityTypeDropdown = screen.getByTestId(ENTITY_TYPE_SELECT_TEST_ID);
    expect(
      within(entityTypeDropdown).queryByRole('button', { name: 'Clear' })
    ).not.toBeInTheDocument();
  });

  it('should maintain selection and not allow clearing', async () => {
    renderWithThemeAndHookFormContext({
      component: (
        <EntityTypeSelect
          name="entity_type"
          onEntityTypeChange={onEntityChange}
        />
      ),
      useFormOptions: {
        defaultValues: {
          entity_type: 'linode',
        },
      },
    });
    expect(screen.getByRole('combobox')).toHaveAttribute('value', 'Linodes');

    // Select a different option
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(
      await screen.findByRole('option', { name: 'NodeBalancers' })
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'value',
      'NodeBalancers'
    );

    // Verify there's no clear button
    const entityTypeDropdown = screen.getByTestId(ENTITY_TYPE_SELECT_TEST_ID);
    expect(
      within(entityTypeDropdown).queryByRole('button', { name: 'Clear' })
    ).not.toBeInTheDocument();
  });

  it('should display tooltip text on hover of the help icon', async () => {
    renderWithThemeAndHookFormContext({
      component: (
        <EntityTypeSelect
          name="entity_type"
          onEntityTypeChange={onEntityChange}
        />
      ),
    });

    const entityTypeContainer = screen.getByTestId(ENTITY_TYPE_SELECT_TEST_ID);
    const helpButton =
      within(entityTypeContainer).getByTestId('tooltip-info-icon');

    await userEvent.hover(helpButton);

    expect(await screen.findByText(entityTypeTooltipText)).toBeVisible();

    await userEvent.unhover(helpButton);
  });
});
