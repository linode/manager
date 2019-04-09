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
    loading={true}
    error={new Error('hello world')}
    disks={disks}
    totalDiskSpace={100}
  />
);

describe('LinodeDiskSpace', () => {
  it('should add up the space in each disk', () => {
    expect(addUsedDiskSpace(disks)).toBe(25600);
  });

  it('should render Loading state if loading prop is true', () => {
    expect(component.find('DiskSpaceLoading')).toHaveLength(1);
  });

  it('should render error state if error prop is true and loading prop is false', () => {
    component.setProps({ loading: false });
    expect(component.find('WithStyles(ErrorState)')).toHaveLength(1);
  });

  it(`should render main content if loading is false and error prop is undefined and
  disks prop is defined`, () => {
    component.setProps({ error: undefined });
    expect(component.children().length).toBeTruthy();
  });

  it(`should render null if data, error, and totalDiskSpace are 
    undefined and loading is false`, () => {
    component.setProps({ disks: undefined });
    component.setProps({ totalDiskSpace: undefined });
    expect(component.children().length).toBeFalsy();
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
