import { shallow } from 'enzyme';
import * as React from 'react';
import { BarPercent, getPercentage } from './BarPercent';

const componentLoading = shallow(
  <BarPercent
    classes={{
      root: '',
      primaryColor: '',
      loadingText: '',
      rounded: '',
      overLimit: ''
    }}
    value={20}
    max={100}
    loadingText="loading..."
    isFetchingValue={true}
    rounded={false}
  />
);

describe('BarPercent', () => {
  it('getPercentage() should correctly return a percentage of max value ', () => {
    expect(getPercentage(50, 100)).toBe(50);
    expect(getPercentage(0, 100)).toBe(0);
    expect(getPercentage(2150, 10000)).toBe(21.5);
  });

  it(`should return loading text and an indeterminate percentage bar if
  isFetchingValue prop is true and loadingText prop is not undefined`, () => {
    expect(componentLoading.find('WithStyles(Typography)')).toBeDefined();
    expect(
      componentLoading
        .find('WithStyles(ForwardRef(LinearProgress))')
        .prop('variant')
    ).toBe('indeterminate');
  });

  it('should return determinate progress bar if isFetchingValue prop is false', () => {
    componentLoading.setProps({ isFetchingValue: false });
    expect(
      componentLoading
        .find('WithStyles(ForwardRef(LinearProgress))')
        .prop('variant')
    ).toBe('determinate');
  });
});
