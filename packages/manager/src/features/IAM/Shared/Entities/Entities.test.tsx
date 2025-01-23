import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Entities } from './Entities';

import type { IamAccountResource } from '@linode/api-v4/lib/resources/types';

const queryMocks = vi.hoisted(() => ({
  useAccountResources: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/resources/resources', async () => {
  const actual = await vi.importActual('src/queries/resources/resources');
  return {
    ...actual,
    useAccountResources: queryMocks.useAccountResources,
  };
});

const mockResources: IamAccountResource[] = [
  {
    resource_type: 'linode',
    resources: [
      {
        id: 23456789,
        name: 'linode-uk-123',
      },
      {
        id: 456728,
        name: 'db-us-southeast1',
      },
    ],
  },
  {
    resource_type: 'image',
    resources: [
      { id: 3, name: 'image-1' },
      { id: 4, name: 'image-2' },
    ],
  },
];

describe('Resources', () => {
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

  it('renders correct data when it is a resources access', () => {
    queryMocks.useAccountResources.mockReturnValue({ data: mockResources });

    const { getAllByRole, getByText } = renderWithTheme(
      <Entities access="resource_access" type="image" />
    );

    expect(getByText('Entities')).toBeInTheDocument();

    // Verify comboboxes exist
    const autocomplete = getAllByRole('combobox');
    expect(autocomplete).toHaveLength(1);
    expect(autocomplete[0]).toBeInTheDocument();
    expect(autocomplete[0]).toHaveAttribute('placeholder', 'Select Images');
  });

  it('renders correct options in Autocomplete dropdown when it is a resources access', () => {
    queryMocks.useAccountResources.mockReturnValue({ data: mockResources });

    const { getAllByRole, getByText } = renderWithTheme(
      <Entities access="resource_access" type="image" />
    );

    expect(getByText('Entities')).toBeInTheDocument();

    const autocomplete = getAllByRole('combobox')[0];
    fireEvent.focus(autocomplete);
    fireEvent.mouseDown(autocomplete);
    expect(getByText('image-1')).toBeInTheDocument();
    expect(getByText('image-2')).toBeInTheDocument();
  });

  it('updates selected options when Autocomplete value changes when it is a resources access', () => {
    const { getAllByRole, getByText } = renderWithTheme(
      <Entities access="resource_access" type="linode" />
    );

    const autocomplete = getAllByRole('combobox')[0];
    fireEvent.change(autocomplete, { target: { value: 'linode-uk-123' } });
    fireEvent.keyDown(autocomplete, { key: 'Enter' });
    expect(getByText('linode-uk-123')).toBeInTheDocument();
  });
});
