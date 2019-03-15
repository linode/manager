import { shallow } from 'enzyme';
import * as React from 'react';
import { ObjectStorageLanding } from './ObjectStorageLanding';

describe('ObjectStorageLanding', () => {
  const wrapper = shallow(
    <ObjectStorageLanding
      classes={{ root: '', title: '', titleWrapper: '' }}
      bucketsData={[]}
      bucketsLoading={false}
    />
  );

  it('renders without crashing', () => {
    expect(wrapper).toHaveLength(1);
  });

  it('renders a "Buckets" title', () => {
    expect(
      wrapper
        .find('[data-qa-title]')
        .childAt(0)
        .text()
    ).toBe('Buckets');
  });

  it('renders an "OrderBy" component, ordered by label', () => {
    expect(wrapper.find('OrderBy').prop('orderBy')).toBe('label');
  });
});
