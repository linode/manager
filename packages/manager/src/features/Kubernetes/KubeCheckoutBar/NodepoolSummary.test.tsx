import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { extendedTypes } from 'src/__data__/ExtendedType';
import { renderWithTheme } from 'src/utilities/testHelpers';
import NodePoolSummary, { Props } from './NodePoolSummary';

const props: Props = {
  nodeCount: 3,
  poolType: extendedTypes[0],
  price: 1000,
  onRemove: jest.fn(),
  updateNodeCount: jest.fn()
};

describe('Node Pool Summary', () => {
  it("should render the label of its pool's plan", () => {
    const { getByText } = renderWithTheme(<NodePoolSummary {...props} />);
    getByText(/Linode 2GB Plan/i);
    getByText(/1 CPU, 50 GB Storage/i);
  });

  it('should call its onRemove handler when the trash can is clicked', () => {
    const { getByTestId } = renderWithTheme(<NodePoolSummary {...props} />);
    fireEvent.click(getByTestId('remove-pool-button'));
    expect(props.onRemove).toHaveBeenCalledTimes(1);
  });

  it("should display its pool's price", () => {
    const { getByText } = renderWithTheme(<NodePoolSummary {...props} />);
    getByText('$1,000.00');
  });
});
