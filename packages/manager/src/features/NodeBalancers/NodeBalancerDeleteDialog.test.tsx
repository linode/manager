import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerDeleteDialog } from './NodeBalancerDeleteDialog';

import type { ManagerPreferences } from 'src/types/ManagerPreferences';

const props = {
  id: 1,
  label: 'nb-1',
  onClose: vi.fn(),
  open: true,
};

const preference: ManagerPreferences['type_to_confirm'] = true;

const queryMocks = vi.hoisted(() => ({
  usePreferences: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/profile/preferences', async () => {
  const actual = await vi.importActual('src/queries/profile/preferences');
  return {
    ...actual,
    usePreferences: queryMocks.usePreferences,
  };
});

queryMocks.usePreferences.mockReturnValue({
  data: preference,
});

describe('NodeBalancerDeleteDialog', () => {
  it('renders the NodeBalancerDeleteDialog', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });

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

  it('calls the onClose function of the dialog', async () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerDeleteDialog {...props} />
    );

    await userEvent.click(getByText('Cancel'));
    expect(props.onClose).toHaveBeenCalled();
  });
});
