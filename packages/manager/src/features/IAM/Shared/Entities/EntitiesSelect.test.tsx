import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { accountEntityFactory } from 'src/factories/accountEntities';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EntitiesSelect } from './EntitiesSelect';

import type { EntitiesOption } from '../types';

// Remove the debounce delay so filter changes take effect synchronously.
vi.mock('@linode/utilities', async () => {
  const actual = await vi.importActual('@linode/utilities');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { ...actual, useDebouncedValue: (value: any) => value };
});

const queryMocks = vi.hoisted(() => ({
  useAllAccountEntities: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/entities/entities', async () => {
  const actual = await vi.importActual('src/queries/entities/entities');
  return {
    ...actual,
    useAllAccountEntities: queryMocks.useAllAccountEntities,
  };
});

const mockEntities = [
  accountEntityFactory.build({
    id: 7,
    type: 'linode',
    label: 'linode',
  }),
  accountEntityFactory.build({
    id: 1,
    label: 'firewall-1',
    type: 'firewall',
  }),
];

const linodeEntities = [
  accountEntityFactory.build({ id: 1, label: 'linode-1', type: 'linode' }),
  accountEntityFactory.build({ id: 2, label: 'linode-2', type: 'linode' }),
];
const bothSelected: EntitiesOption[] = [
  { label: 'linode-1', value: 1 },
  { label: 'linode-2', value: 2 },
];

const mockOnChange = vi.fn();
const mockValue: EntitiesOption[] = [];

describe('Entities', () => {
  it('renders correct data when it is an account access and type is an account', () => {
    renderWithTheme(
      <EntitiesSelect
        access="account_access"
        mode="assign-role"
        onChange={mockOnChange}
        type="account"
        value={mockValue}
      />
    );

    const autocomplete = screen.queryAllByRole('combobox');

    expect(screen.getByText('Entities')).toBeVisible();
    expect(screen.getByText('All entities')).toBeVisible();

    // check that the autocomplete doesn't exist
    expect(autocomplete.length).toBe(0);
    expect(autocomplete[0]).toBeUndefined();
  });

  it('renders correct data when it is an account access and type is not an account', () => {
    renderWithTheme(
      <EntitiesSelect
        access="account_access"
        mode="assign-role"
        onChange={mockOnChange}
        type="firewall"
        value={mockValue}
      />
    );

    const autocomplete = screen.queryAllByRole('combobox');

    expect(screen.getByText('Entities')).toBeVisible();
    expect(screen.getByText('All Firewalls')).toBeVisible();

    // check that the autocomplete doesn't exist
    expect(autocomplete.length).toBe(0);
    expect(autocomplete[0]).toBeUndefined();
  });

  it('renders correct data when it is an entity access', () => {
    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    const { container } = renderWithTheme(
      <EntitiesSelect
        access="entity_access"
        mode="assign-role"
        onChange={mockOnChange}
        type="image"
        value={mockValue}
      />
    );

    expect(screen.getByText('Entities')).toBeVisible();
    // SelectionPanel renders a cds-search-field instead of a combobox
    expect(container.querySelector('cds-search-field')).toBeInTheDocument();
    // No image entities in mockEntities, so the warning link is shown
    const link = screen.getByRole('link', { name: /Create an Image Entity/i });
    expect(link).toBeVisible();
  });

  it('renders correct data when it is an entity access', () => {
    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    const { container } = renderWithTheme(
      <EntitiesSelect
        access="entity_access"
        mode="assign-role"
        onChange={mockOnChange}
        type="vpc"
        value={mockValue}
      />
    );

    expect(screen.getByText('Entities')).toBeVisible();
    expect(container.querySelector('cds-search-field')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Create a VPC Entity/i });
    expect(link).toBeVisible();
  });

  it('renders entity options in the table when it is an entity access', () => {
    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithTheme(
      <EntitiesSelect
        access="entity_access"
        mode="assign-role"
        onChange={mockOnChange}
        type="firewall"
        value={mockValue}
      />
    );

    expect(screen.getByText('Entities')).toBeVisible();
    // firewall-1 appears directly as a table row (no click needed)
    expect(screen.getByText('firewall-1')).toBeVisible();
  });

  it('renders entity options in the table when it is an entity access', () => {
    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithTheme(
      <EntitiesSelect
        access="entity_access"
        mode="assign-role"
        onChange={mockOnChange}
        type="linode"
        value={mockValue}
      />
    );

    // linode appears directly as a table row
    expect(screen.getByText('linode')).toBeVisible();
  });

  it('disables interactions when mode is "change-role"', () => {
    const { container } = renderWithTheme(
      <EntitiesSelect
        access="entity_access"
        mode="change-role"
        onChange={mockOnChange}
        type="linode"
        value={mockValue}
      />
    );

    // In readonly mode the search field is disabled
    const searchField = container.querySelector<
      HTMLElement & { disabled?: boolean }
    >('cds-search-field');
    expect(searchField?.disabled).toBe(true);
  });

  it('displays errorText when provided', () => {
    const errorMessage = 'Entities are required.';

    renderWithTheme(
      <EntitiesSelect
        access="entity_access"
        errorText={errorMessage}
        mode="assign-role"
        onChange={mockOnChange}
        type="linode"
        value={mockValue}
      />
    );

    // Verify that the error message is displayed
    expect(screen.getByText(errorMessage)).toBeVisible();
  });

  it('filters visible rows by search text when the toggle is active', async () => {
    queryMocks.useAllAccountEntities.mockReturnValue({ data: linodeEntities });
    const { container } = renderWithTheme(
      <EntitiesSelect
        access="entity_access"
        mode="assign-role"
        onChange={mockOnChange}
        type="linode"
        value={bothSelected}
      />
    );

    // Enable "Show selected only"
    const showSelectedOnlyCheckbox = container.querySelector<
      HTMLElement & { checked?: boolean }
    >('cds-checkbox');
    showSelectedOnlyCheckbox!.dispatchEvent(
      new CustomEvent('change', { bubbles: true, detail: true })
    );

    // Wait for state to propagate
    await waitFor(() => expect(showSelectedOnlyCheckbox?.checked).toBe(true));

    // Both rows visible before any filter
    expect(screen.getByText('linode-1')).toBeVisible();
    expect(screen.getByText('linode-2')).toBeVisible();

    // Type a filter targeting only linode-1
    const searchField = container.querySelector('cds-search-field');
    fireEvent.change(searchField!, { target: { value: 'linode-1' } });

    // With useDebouncedValue mocked as pass-through, filter applies immediately
    await waitFor(() => {
      expect(screen.getByText('linode-1')).toBeVisible();
      expect(screen.queryByText('linode-2')).not.toBeInTheDocument();
    });
  });

  it('deactivates the toggle when "Clear all" empties the selection', async () => {
    queryMocks.useAllAccountEntities.mockReturnValue({ data: linodeEntities });
    const { container } = renderWithTheme(
      <EntitiesSelect
        access="entity_access"
        mode="assign-role"
        onChange={mockOnChange}
        type="linode"
        value={bothSelected}
      />
    );

    // Enable "Show selected only"
    const showSelectedOnlyCheckbox = container.querySelector<
      HTMLElement & { checked?: boolean }
    >('cds-checkbox');
    showSelectedOnlyCheckbox!.dispatchEvent(
      new CustomEvent('change', { bubbles: true, detail: true })
    );

    await waitFor(() => expect(showSelectedOnlyCheckbox?.checked).toBe(true));

    // Click "Clear all" (synchronous fireEvent avoids async-act issues)
    fireEvent.click(screen.getByText('Clear all'));

    // onChange must have been called to clear the selection
    expect(mockOnChange).toHaveBeenCalledWith([]);

    // The toggle must be automatically deactivated
    await waitFor(() => expect(showSelectedOnlyCheckbox?.checked).toBeFalsy());
  });
});
