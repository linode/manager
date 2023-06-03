import * as React from 'react';

import { extendedTypes } from 'src/__data__/ExtendedType';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SelectPlanPanel } from './SelectPlanPanel';

describe('Select Plan Panel', () => {
  it('should render TabbedPanel', () => {
    const { getByText } = renderWithTheme(
      <SelectPlanPanel
        types={extendedTypes}
        currentPlanHeading="Linode 2GB"
        selectedID="test"
        onSelect={jest.fn()}
      />
    );
    getByText(/linode plan/i);
  });
});
