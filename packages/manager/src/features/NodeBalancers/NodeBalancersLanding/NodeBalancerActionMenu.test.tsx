import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerActionMenu } from './NodeBalancerActionMenu';

const props = {
  label: 'nodebalancer-1',
  nodeBalancerId: 1,
  toggleDialog: vi.fn(),
};

describe('NodeBalancerActionMenu', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the NodeBalancerActionMenu', () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerActionMenu {...props} />
    );

    expect(getByText('Configurations')).toBeVisible();
    expect(getByText('Settings')).toBeVisible();
    expect(getByText('Delete')).toBeVisible();
  });

  it('triggers the action to delete the NodeBalancer', () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerActionMenu {...props} />
    );

    const deleteButton = getByText('Delete');
    fireEvent.click(deleteButton);
    expect(props.toggleDialog).toHaveBeenCalled();
  });
});
