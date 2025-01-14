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
  forEdit: true,
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

  it('cannot change the mode if the node is not for edit', () => {
    const { queryByText } = renderWithTheme(
      <NodeBalancerConfigNode {...props} forEdit={false} />
    );

    expect(queryByText('Mode')).not.toBeInTheDocument();
  });

  it('cannot remove the node if the node is not for edit or is the first node', () => {
    const { queryByText } = renderWithTheme(
      <NodeBalancerConfigNode {...props} forEdit={false} idx={0} />
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
