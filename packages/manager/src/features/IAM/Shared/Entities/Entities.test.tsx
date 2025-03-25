import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Entities } from './Entities';

import type { IamAccountEntities } from '@linode/api-v4/lib/resources/types';

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

const mockEntities: IamAccountEntities = {
  data: [
    {
      id: 7,
      label: 'linode7',
      type: 'linode',
    },
    {
      id: 1,
      label: 'no_devices',
      type: 'firewall',
    },
    {
      id: 1,
      label: 'image-2',
      type: 'image',
    },
    {
      id: 3,
      label: 'image-1',
      type: 'image',
    },
  ],
};

describe('Entities', () => {
  it('renders correct data when it is an account access and type is an account', () => {
    const { getByText, queryAllByRole } = renderWithTheme(
      <Entities access="account_access" type="account" />
    );

    const autocomplete = queryAllByRole('combobox');

    expect(getByText('Entities')).toBeInTheDocument();
    expect(getByText('All entities')).toBeInTheDocument();

    // check that the autocomplete doesn't exist
    expect(autocomplete.length).toBe(0);
    expect(autocomplete[0]).toBeUndefined();
  });

  it('renders correct data when it is an account access and type is not an account', () => {
    const { getByText, queryAllByRole } = renderWithTheme(
      <Entities access="account_access" type="firewall" />
    );

    const autocomplete = queryAllByRole('combobox');

    expect(getByText('Entities')).toBeInTheDocument();
    expect(getByText('All firewalls')).toBeInTheDocument();

    // check that the autocomplete doesn't exist
    expect(autocomplete.length).toBe(0);
    expect(autocomplete[0]).toBeUndefined();
  });

  it('renders correct data when it is an entity access', () => {
    queryMocks.useAccountEntities.mockReturnValue({ data: mockEntities });

    const { getAllByRole, getByText } = renderWithTheme(
      <Entities access="entity_access" type="image" />
    );

    expect(getByText('Entities')).toBeInTheDocument();

    // Verify comboboxes exist
    const autocomplete = getAllByRole('combobox');
    expect(autocomplete).toHaveLength(1);
    expect(autocomplete[0]).toBeInTheDocument();
    expect(autocomplete[0]).toHaveAttribute('placeholder', 'Select Images');
  });

  it('renders correct options in Autocomplete dropdown when it is an entity access', () => {
    queryMocks.useAccountEntities.mockReturnValue({ data: mockEntities });

    const { getAllByRole, getByText } = renderWithTheme(
      <Entities access="entity_access" type="image" />
    );

    expect(getByText('Entities')).toBeInTheDocument();

    const autocomplete = getAllByRole('combobox')[0];
    fireEvent.focus(autocomplete);
    fireEvent.mouseDown(autocomplete);
    expect(getByText('image-1')).toBeInTheDocument();
    expect(getByText('image-2')).toBeInTheDocument();
  });

  it('updates selected options when Autocomplete value changes when it is an entity access', () => {
    const { getAllByRole, getByText } = renderWithTheme(
      <Entities access="entity_access" type="linode" />
    );

    const autocomplete = getAllByRole('combobox')[0];
    fireEvent.change(autocomplete, { target: { value: 'linode7' } });
    fireEvent.keyDown(autocomplete, { key: 'Enter' });
    expect(getByText('linode7')).toBeInTheDocument();
  });
});
