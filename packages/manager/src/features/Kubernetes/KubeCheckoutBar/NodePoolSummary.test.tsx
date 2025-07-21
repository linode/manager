import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { extendedTypes } from 'src/__data__/ExtendedType';
import { renderWithTheme } from 'src/utilities/testHelpers';

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
    const { getByText } = renderWithTheme(<NodePoolSummaryItem {...props} />);
    getByText(/Linode 2 GB Plan/i);
    getByText(/1 CPU, 50 GB Storage/i);
  });

  it('should call its onRemove handler when the trash can is clicked', async () => {
    const { getByTestId } = renderWithTheme(<NodePoolSummaryItem {...props} />);
    await userEvent.click(getByTestId('remove-pool-button'));
    expect(props.onRemove).toHaveBeenCalledTimes(1);
  });

  it("should display its pool's price", () => {
    const { getByText } = renderWithTheme(<NodePoolSummaryItem {...props} />);
    getByText('$1,000.00');
  });
});
