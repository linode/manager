import { shallow } from 'enzyme';
import * as React from 'react';

import { disks } from 'src/__data__/disks';
import { addUsedDiskSpace, LinodeDiskSpace } from './LinodeDiskSpace';

const component = shallow(
  <LinodeDiskSpace
    classes={{
      root: '',
      header: '',
      bar: '',
      text: '',
      divider: '',
      textOuter: '',
      code: ''
    }}
    disks={disks}
    totalDiskSpace={100}
  />
);

describe('LinodeDiskSpace', () => {
  it('should add up the space in each disk', () => {
    expect(addUsedDiskSpace(disks)).toBe(25600);
  });

  describe('percentages', () => {
    it('should return 0% if no disk space is used', () => {
      component.setProps({ disks: [], totalDiskSpace: 27000 });
      expect(component.find('[data-qa-disk-used-percentage]').text()).toBe(
        '0%'
      );
    });

    it('should return < 1% if used percentage is between 0 and 1', () => {
      component.setProps({ disks, totalDiskSpace: 10000000 });
      expect(component.find('[data-qa-disk-used-percentage]').text()).toBe(
        '< 1%'
      );
    });

    it('should return percentage if usedPercentage is above 1', () => {
      component.setProps({ disks, totalDiskSpace: 25600 });
      expect(component.find('[data-qa-disk-used-percentage]').text()).toBe(
        '100%'
      );
      component.setProps({ disks, totalDiskSpace: 27000 });
      expect(component.find('[data-qa-disk-used-percentage]').text()).toBe(
        '94%'
      );
    });
  });
});
