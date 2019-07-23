import { shallow } from 'enzyme';
import * as React from 'react';

import { extendedTypes } from 'src/__data__/ExtendedType';

import { SelectPlanPanel } from './SelectPlanPanel';

describe('Select Plan Panel', () => {
  const component = shallow(
    <SelectPlanPanel
      classes={{ root: '', copy: '' }}
      types={extendedTypes}
      currentPlanHeading="Linode 2GB"
      selectedID="test"
      onSelect={jest.fn()}
    />
  );
  it('should render TabbedPanel', () => {
    expect(component.find('WithStyles(TabbedPanel)')).toHaveLength(1);
  });
});
