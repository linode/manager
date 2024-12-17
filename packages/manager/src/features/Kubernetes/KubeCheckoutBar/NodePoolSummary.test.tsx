import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { extendedTypes } from 'src/__data__/ExtendedType';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodePoolSummaryItem } from './NodePoolSummaryItem';

import type { Props } from './NodePoolSummaryItem';

const props: Props = {
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

  it('should call its onRemove handler when the trash can is clicked', () => {
    const { getByTestId } = renderWithTheme(<NodePoolSummaryItem {...props} />);
    fireEvent.click(getByTestId('remove-pool-button'));
    expect(props.onRemove).toHaveBeenCalledTimes(1);
  });

  it("should display its pool's price", () => {
    const { getByText } = renderWithTheme(<NodePoolSummaryItem {...props} />);
    getByText('$1,000.00');
  });
});
