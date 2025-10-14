import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { extendedTypes } from 'src/__data__/ExtendedType';
import { nodePoolFactory } from 'src/factories/kubernetesCluster';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { NodePoolSummaryItem } from './NodePoolSummaryItem';

import type { Props } from './NodePoolSummaryItem';

const props: Props = {
  poolIndex: 0,
  nodeCount: 3,
  onRemove: vi.fn(),
  poolType: extendedTypes[1],
  price: 1000,
  updateNodeCount: vi.fn(),
};

describe('Node Pool Summary Item', () => {
  it("should render the label of its pool's plan", () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <NodePoolSummaryItem {...props} />,
      useFormOptions: {
        defaultValues: {
          nodePools: [nodePoolFactory.build()],
        },
      },
    });
    getByText(/Linode 2 GB Plan/i);
    getByText(/1 CPU, 50 GB Storage/i);
  });

  it('should call its onRemove handler when the trash can is clicked', async () => {
    const { getByTestId } = renderWithThemeAndHookFormContext({
      component: <NodePoolSummaryItem {...props} />,
      useFormOptions: {
        defaultValues: {
          nodePools: [nodePoolFactory.build()],
        },
      },
    });
    await userEvent.click(getByTestId('remove-pool-button'));
    expect(props.onRemove).toHaveBeenCalledTimes(1);
  });

  it("should display its pool's price", () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <NodePoolSummaryItem {...props} />,
      useFormOptions: {
        defaultValues: {
          nodePools: [nodePoolFactory.build()],
        },
      },
    });
    getByText('$1,000.00');
  });
});
