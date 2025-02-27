import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AssignedEntities } from './AssignedEntities';

const mockEntities: string[] = ['linode-uk-123'];

const mockEntitiesLong: string[] = [
  'debian-us-123',
  'linode-uk-123',
  'debian-us-1',
  'linode-uk-1',
  'debian-us-2',
  'linode-uk-2',
  'debian-us-3',
  'linode-uk-3',
  'debian-us-4',
  'linode-uk-4',
];

const handleClick = vi.fn();

describe('AssignedEntities', () => {
  it('renders the correct number of entity chips', () => {
    const { getAllByTestId, getByText } = renderWithTheme(
      <AssignedEntities
        entities={mockEntities}
        onButtonClick={handleClick}
        roleName="linode_viewer"
      />
    );

    const chips = getAllByTestId('entities');
    expect(chips).toHaveLength(1);

    expect(getByText('linode-uk-123')).toBeInTheDocument();
  });

  it('renders the correct number of entity chips', () => {
    const { getAllByTestId } = renderWithTheme(
      <AssignedEntities
        entities={mockEntitiesLong}
        onButtonClick={handleClick}
        roleName="linode_viewer"
      />
    );

    const chips = getAllByTestId('entities');
    expect(chips).toHaveLength(mockEntitiesLong.length);
  });
});
