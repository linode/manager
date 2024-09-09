import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { nodeBalancerFactory } from 'src/factories';
import { breakpoints } from 'src/foundations/breakpoints';
import { renderWithTheme, resizeScreenSize } from 'src/utilities/testHelpers';

import { NodeBalancerTableRow } from './NodeBalancerTableRow';

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

  it('renders the hidden columns when the screen width is larger', () => {
    resizeScreenSize(breakpoints.values.lg);
    const { getByText } = renderWithTheme(<NodeBalancerTableRow {...props} />);

    expect(getByText('nodebalancer-id-1')).toBeVisible();
    expect(getByText('0 up')).toBeVisible();
    expect(getByText('0 down')).toBeVisible();
    expect(getByText('0 bytes')).toBeVisible();
    expect(getByText('0.0.0.0')).toBeVisible();
    expect(getByText('us-east')).toBeVisible();
  });

  it('calls onDelete', () => {
    const { getByText } = renderWithTheme(<NodeBalancerTableRow {...props} />);

    const deleteButton = getByText('Delete');
    fireEvent.click(deleteButton);
    expect(props.onDelete).toHaveBeenCalled();
  });
});
