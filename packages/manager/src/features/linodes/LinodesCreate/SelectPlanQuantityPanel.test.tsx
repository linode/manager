import { vi } from 'vitest';
import * as React from 'react';

import { extendedTypes } from 'src/__data__/ExtendedType';
import { renderWithTheme } from 'src/utilities/testHelpers';

import SelectPlanQuantityPanel from './SelectPlanQuantityPanel';

describe('Select Plan Panel', () => {
  it('should render TabbedPanel', async () => {
    const { findByText } = renderWithTheme(
      <SelectPlanQuantityPanel
        types={extendedTypes}
        getTypeCount={() => 0}
        selectedID={undefined}
        onSelect={vi.fn()}
        resetValues={vi.fn()}
        updatePlanCount={vi.fn()}
      />
    );
    await findByText('Dedicated CPU');
    await findByText('Shared CPU');
    await findByText('High Memory');
    await findByText('GPU');
  });
});
