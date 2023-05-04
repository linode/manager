import { vi } from 'vitest';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import NodePoolPanel from './NodePoolPanel';
import { extendedTypes } from 'src/__data__';

const props = {
  clusterId: 0,
  clusterLabel: 'test',
  open: true,
  onClose: vi.fn(),
  types: extendedTypes,
  typesLoading: false,
  addNodePool: vi.fn(),
};

describe('NodePoolPanel', () => {
  it('should render plan heading', async () => {
    const { findByText } = renderWithTheme(<NodePoolPanel {...props} />);

    await findByText('Dedicated CPU');
  });
});
