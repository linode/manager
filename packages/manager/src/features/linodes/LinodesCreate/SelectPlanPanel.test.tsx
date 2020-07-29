import { shallow } from 'enzyme';
import * as React from 'react';

import { extendedTypes } from 'src/__data__/ExtendedType';

import { SelectPlanPanel } from './SelectPlanPanel';

describe('Select Plan Panel', () => {
  const component = shallow(
    <SelectPlanPanel
      classes={{
        root: '',
        copy: '',
        disabledRow: '',
        chip: '',
        currentPlanChipCell: '',
        radioCell: '',
        headingCellContainer: ''
      }}
      types={extendedTypes}
      currentPlanHeading="Linode 2GB"
      selectedID="test"
      onSelect={jest.fn()}
      regionsData={[]}
      regionsLoading={false}
      regionsLastUpdated={0}
    />
  );
  it('should render without crashing', () => {
    expect(component).toHaveLength(1);
  });

  it('should render TabbedPanel', () => {
    expect(component.find('[data-qa-select-plan]')).toHaveLength(1);
  });
});
