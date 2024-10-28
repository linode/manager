import { breakpoints } from '@linode/ui';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { nodeBalancerFactory } from 'src/factories';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { renderWithTheme, resizeScreenSize } from 'src/utilities/testHelpers';

import { NodeBalancerTableRow } from './NodeBalancerTableRow';

vi.mock('src/hooks/useIsResourceRestricted');

const props = {
  ...nodeBalancerFactory.build(),
  onDelete: vi.fn(),
};

describe('NodeBalancerTableRow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the NodeBalancer table row', () => {
    const { getByText } = renderWithTheme(<NodeBalancerTableRow {...props} />);

    expect(getByText('nodebalancer-id-1')).toBeVisible();
    expect(getByText('0.0.0.0')).toBeVisible();
    expect(getByText('Configurations')).toBeVisible();
    expect(getByText('Settings')).toBeVisible();
    expect(getByText('Delete')).toBeVisible();
  });

  it('renders the hidden columns when the screen width is large enough', () => {
    resizeScreenSize(breakpoints.values.lg);
    const { getByText } = renderWithTheme(<NodeBalancerTableRow {...props} />);

    expect(getByText('nodebalancer-id-1')).toBeVisible();
    expect(getByText('0 up')).toBeVisible();
    expect(getByText('0 down')).toBeVisible();
    expect(getByText('0 bytes')).toBeVisible();
    expect(getByText('0.0.0.0')).toBeVisible();
    expect(getByText('us-east')).toBeVisible();
  });

  it('deletes the NodeBalancer', async () => {
    const { getByText } = renderWithTheme(<NodeBalancerTableRow {...props} />);

    const deleteButton = getByText('Delete');
    await userEvent.click(deleteButton);
    expect(props.onDelete).toHaveBeenCalled();
  });

  it('does not delete the NodeBalancer if the delete button is disabled', async () => {
    vi.mocked(useIsResourceRestricted).mockReturnValue(true);
    const { getByText } = renderWithTheme(<NodeBalancerTableRow {...props} />);

    const deleteButton = getByText('Delete');
    await userEvent.click(deleteButton);
    expect(props.onDelete).not.toHaveBeenCalled();
  });
});
