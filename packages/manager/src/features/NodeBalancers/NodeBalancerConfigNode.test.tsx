import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerConfigNode } from './NodeBalancerConfigNode';

import type { NodeBalancerConfigNodeProps } from './NodeBalancerConfigNode';

const node = {
  address: 'some address',
  label: 'some label',
};

const props: NodeBalancerConfigNodeProps = {
  configIdx: 1,
  disabled: false,
  disallowRemoval: false,
  hideModeSelect: false,
  idx: 1,
  node,
  onNodeAddressChange: vi.fn(),
  onNodeLabelChange: vi.fn(),
  onNodeModeChange: vi.fn(),
  onNodePortChange: vi.fn(),
  onNodeWeightChange: vi.fn(),
  removeNode: vi.fn(),
};

describe('NodeBalancerConfigNode', () => {
  it('renders the NodeBalancerConfigNode', () => {
    const { getByLabelText, getByText, queryByText } = renderWithTheme(
      <NodeBalancerConfigNode {...props} />
    );

    expect(getByLabelText('Label')).toBeVisible();
    expect(getByLabelText('Port')).toBeVisible();
    expect(getByLabelText('Weight')).toBeVisible();
    expect(getByText('Mode')).toBeVisible();
    expect(getByText('Remove')).toBeVisible();
    expect(queryByText('Status')).not.toBeInTheDocument();
  });

  it('renders the node status', () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerConfigNode {...props} node={{ ...node, status: 'DOWN' }} />
    );

    expect(getByText('Status')).toBeVisible();
    expect(getByText('DOWN')).toBeVisible();
  });

  it('hides the "Mode" select if hideModeSelect is true', () => {
    const { queryByText } = renderWithTheme(
      <NodeBalancerConfigNode {...props} hideModeSelect />
    );

    expect(queryByText('Mode')).not.toBeInTheDocument();
  });

  it('cannot remove the node if the disallowRemoval is true', () => {
    const { queryByText } = renderWithTheme(
      <NodeBalancerConfigNode {...props} disallowRemoval />
    );

    expect(queryByText('Remove')).not.toBeInTheDocument();
  });

  it('removes the node', async () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerConfigNode {...props} />
    );

    await userEvent.click(getByText('Remove'));
    expect(props.removeNode).toHaveBeenCalled();
  });
});
