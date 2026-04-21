import { nodeBalancerFactory } from '@linode/utilities';
import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerDetailFooter } from './NodeBalancerDetailFooter';

type MockTagCellProps = {
  disabled?: boolean;
  entity?: string;
  tags: string[];
  updateTags: (tags: string[]) => Promise<unknown>;
  view: 'inline' | 'panel';
};

const queryMocks = vi.hoisted(() => ({
  mockTagCell: vi.fn(),
  updateNodeBalancer: vi.fn().mockResolvedValue({}),
  useNodebalancerUpdateMutation: vi.fn(),
  usePermissions: vi.fn(),
}));

vi.mock('src/components/TagCell/TagCell', () => ({
  TagCell: (props: MockTagCellProps) => {
    queryMocks.mockTagCell(props);

    return (
      <div>
        <div>{props.entity}</div>
        <button aria-disabled={props.disabled ? 'true' : undefined}>
          Add a tag
        </button>
        <button onClick={() => void props.updateTags(['updated-tag'])}>
          Save tags
        </button>
        <div>{props.tags.join(', ')}</div>
        <div>{props.view}</div>
      </div>
    );
  },
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.usePermissions,
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useNodebalancerUpdateMutation: queryMocks.useNodebalancerUpdateMutation,
  };
});

describe('NodeBalancerDetailFooter', () => {
  const nodebalancer = nodeBalancerFactory.build({
    id: 1,
    tags: ['very-long-tag'],
  });

  beforeEach(() => {
    queryMocks.mockTagCell.mockReset();
    queryMocks.updateNodeBalancer.mockReset();
    queryMocks.updateNodeBalancer.mockResolvedValue({});
    queryMocks.useNodebalancerUpdateMutation.mockReturnValue({
      mutateAsync: queryMocks.updateNodeBalancer,
    });
    queryMocks.usePermissions.mockReturnValue({
      data: {
        is_account_admin: false,
      },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('disables Add a tag when the user is not an account admin', () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerDetailFooter nodebalancer={nodebalancer} />
    );

    expect(getByText('Add a tag')).toHaveAttribute('aria-disabled', 'true');
    expect(queryMocks.mockTagCell).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled: true,
        entity: 'NodeBalancer',
        tags: nodebalancer.tags,
        view: 'inline',
      })
    );
  });

  it('enables Add a tag and updates nodebalancer tags when the user has permission', async () => {
    queryMocks.usePermissions.mockReturnValue({
      data: {
        is_account_admin: true,
      },
    });

    const { getByText } = renderWithTheme(
      <NodeBalancerDetailFooter nodebalancer={nodebalancer} />
    );

    expect(getByText('Add a tag')).not.toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(getByText('Save tags'));

    await waitFor(() => {
      expect(queryMocks.updateNodeBalancer).toHaveBeenCalledWith({
        tags: ['updated-tag'],
      });
    });
  });
});
