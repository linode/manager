import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountEntityFactory } from 'src/factories/accountEntities';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { Entities } from './Entities';

import type { EntitiesOption } from '../types';

const queryMocks = vi.hoisted(() => ({
  useAccountEntities: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/entities/entities', async () => {
  const actual = await vi.importActual('src/queries/entities/entities');
  return {
    ...actual,
    useAccountEntities: queryMocks.useAccountEntities,
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

const mockOnChange = vi.fn();
const mockValue: EntitiesOption[] = [];

describe('Entities', () => {
  it('renders correct data when it is an account access and type is an account', () => {
    renderWithTheme(
      <Entities
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
      <Entities
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
    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    renderWithTheme(
      <Entities
        access="entity_access"
        mode="assign-role"
        onChange={mockOnChange}
        type="image"
        value={mockValue}
      />
    );

    expect(screen.getByText('Entities')).toBeVisible();

    // Verify comboboxes exist
    const autocomplete = screen.getAllByRole('combobox');
    expect(autocomplete).toHaveLength(1);
    expect(autocomplete[0]).toBeVisible();
    expect(autocomplete[0]).toHaveAttribute('placeholder', 'None');
    const link = screen.getByRole('link', { name: /Create an Image Entity/i });
    expect(link).toBeVisible();
  });

  it('renders correct data when it is an entity access', () => {
    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    renderWithTheme(
      <Entities
        access="entity_access"
        mode="assign-role"
        onChange={mockOnChange}
        type="vpc"
        value={mockValue}
      />
    );

    expect(screen.getByText('Entities')).toBeVisible();

    // Verify comboboxes exist
    const autocomplete = screen.getAllByRole('combobox');
    expect(autocomplete).toHaveLength(1);
    expect(autocomplete[0]).toBeVisible();
    expect(autocomplete[0]).toHaveAttribute('placeholder', 'None');
    const link = screen.getByRole('link', { name: /Create a VPC Entity/i });
    expect(link).toBeVisible();
  });

  it('renders correct options in Autocomplete dropdown when it is an entity access', async () => {
    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    renderWithTheme(
      <Entities
        access="entity_access"
        mode="assign-role"
        onChange={mockOnChange}
        type="firewall"
        value={mockValue}
      />
    );

    expect(screen.getByText('Entities')).toBeVisible();

    const autocomplete = screen.getAllByRole('combobox')[0];
    await userEvent.click(autocomplete);
    expect(screen.getByText('firewall-1')).toBeVisible();
  });

  it('updates selected options when Autocomplete value changes when it is an entity access', async () => {
    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    renderWithTheme(
      <Entities
        access="entity_access"
        mode="assign-role"
        onChange={mockOnChange}
        type="linode"
        value={mockValue}
      />
    );

    const autocomplete = screen.getAllByRole('combobox')[0];
    await userEvent.click(autocomplete);
    expect(screen.getByText('linode')).toBeVisible();
  });

  it('renders Autocomplete as readonly when mode is "change-role"', () => {
    renderWithTheme(
      <Entities
        access="entity_access"
        mode="change-role"
        onChange={mockOnChange}
        type="linode"
        value={mockValue}
      />
    );

    const autocomplete = screen.getByRole('combobox');
    expect(autocomplete).toBeVisible();
    expect(autocomplete).toHaveAttribute('aria-expanded', 'false');
  });

  it('displays errorText when provided', () => {
    const errorMessage = 'Entities are required.';

    renderWithTheme(
      <Entities
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
});
