import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerDeleteDialog } from './NodeBalancerDeleteDialog';

const props = {
  id: 1,
  label: 'nb-1',
  onClose: vi.fn(),
  open: true,
};

describe('NodeBalancerDeleteDialog', () => {
  it('renders the NodeBalancerDeleteDialog', () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerDeleteDialog {...props} />
    );

    expect(
      getByText('Deleting this NodeBalancer is permanent and can’t be undone.')
    ).toBeVisible();
    expect(
      getByText(
        'Traffic will no longer be routed through this NodeBalancer. Please check your DNS settings and either provide the IP address of another active NodeBalancer, or route traffic directly to your Linode.'
      )
    ).toBeVisible();
    expect(getByText('Delete nb-1?')).toBeVisible();
    expect(getByText('NodeBalancer Label')).toBeVisible();
    expect(getByText('Cancel')).toBeVisible();
    expect(getByText('Delete')).toBeVisible();
  });

  it('calls the onClose function of the dialog', () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerDeleteDialog {...props} />
    );

    fireEvent.click(getByText('Cancel'));
    expect(props.onClose).toHaveBeenCalled();
  });
});
