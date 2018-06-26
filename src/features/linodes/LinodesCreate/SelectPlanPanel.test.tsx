import * as React from 'react';

import { shallow } from 'enzyme';

import { SelectPlanPanel } from './SelectPlanPanel';

import { ExtendedType } from 'src/__data__/ExtendedType';

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