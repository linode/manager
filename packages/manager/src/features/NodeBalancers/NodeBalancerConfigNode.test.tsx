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
  permissions: {
    update_nodebalancer: true,
    delete_nodebalancer: true,
    create_nodebalancer_config: true,
    create_nodebalancer: true,
  },
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

  it('should enable all fields if user has update_nodebalancer permission for edit mode', () => {
    const { getByLabelText, queryByText } = renderWithTheme(
      <NodeBalancerConfigNode
        {...props}
        forEdit={true}
        permissions={{
          create_nodebalancer_config: true,
          delete_nodebalancer: true,
          update_nodebalancer: true,
        }}
      />
    );

    const portField = getByLabelText('Port');
    expect(portField).not.toHaveAttribute('aria-disabled', true);

    const labelField = getByLabelText('Label');
    expect(labelField).not.toHaveAttribute('aria-disabled', true);

    expect(queryByText('Remove')).not.toHaveAttribute('aria-disabled', true);
  });

  it('should disable all fields if user does not have update_nodebalancer permission for edit mode', () => {
    const { getByLabelText, queryByText } = renderWithTheme(
      <NodeBalancerConfigNode
        {...props}
        forEdit={true}
        permissions={{
          create_nodebalancer_config: false,
          delete_nodebalancer: false,
          update_nodebalancer: false,
        }}
      />
    );

    const portField = getByLabelText('Port');
    expect(portField).toBeDisabled();

    const labelField = getByLabelText('Label');
    expect(labelField).toBeDisabled();

    expect(queryByText('Remove')).toBeDisabled();
  });

  it('should enable all fields if user has create_nodebalancer permission for create mode', () => {
    const { getByLabelText, queryByText } = renderWithTheme(
      <NodeBalancerConfigNode
        {...props}
        permissions={{
          create_nodebalancer: true,
        }}
      />
    );

    const portField = getByLabelText('Port');
    expect(portField).not.toHaveAttribute('aria-disabled', true);

    const labelField = getByLabelText('Label');
    expect(labelField).not.toHaveAttribute('aria-disabled', true);

    expect(queryByText('Remove')).not.toHaveAttribute('aria-disabled', true);
  });

  it('should disable all fields if user does not have create_nodebalancer permission for create mode', () => {
    const { getByLabelText, queryByText } = renderWithTheme(
      <NodeBalancerConfigNode
        {...props}
        permissions={{
          create_nodebalancer: false,
        }}
      />
    );

    const portField = getByLabelText('Port');
    expect(portField).toBeDisabled();

    const labelField = getByLabelText('Label');
    expect(labelField).toBeDisabled();

    expect(queryByText('Remove')).toBeDisabled();
  });
});
