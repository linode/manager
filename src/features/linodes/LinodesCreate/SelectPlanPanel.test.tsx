import { shallow } from 'enzyme';
import * as React from 'react';

import { ExtendedType } from 'src/__data__/ExtendedType';

import { SelectPlanPanel } from './SelectPlanPanel';

describe('Select Plan Panel', () => {

  const component = shallow(
    <SelectPlanPanel
      classes={{ root: '' }}
      types={ExtendedType}
      currentPlanHeading='Linode 2GB'
      selectedID='test'
      onSelect={jest.fn()}
    />
  )
  it('should render TabbedPanel', () => {
    expect(component.find('WithStyles(TabbedPanel)')).toHaveLength(1);
  });
})
