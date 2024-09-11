import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerConfigNode } from './NodeBalancerConfigNode';

import type { NodeBalancerConfigNodeProps } from './NodeBalancerConfigNode';

const props: NodeBalancerConfigNodeProps = {
  configIdx: 1,
  disabled: false,
  forEdit: true,
  idx: 1,
  node: {
    address: 'some address',
    label: 'some label',
  },
  onNodeAddressChange: vi.fn(),
  onNodeLabelChange: vi.fn(),
  onNodeModeChange: vi.fn(),
  onNodePortChange: vi.fn(),
  onNodeWeightChange: vi.fn(),
  removeNode: vi.fn(),
};

describe('NodeBalancerConfigNode', () => {
  it('removes the node', () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerConfigNode {...props} />
    );

    fireEvent.click(getByText('Remove'));
    expect(props.removeNode).toHaveBeenCalled();
  });
});
