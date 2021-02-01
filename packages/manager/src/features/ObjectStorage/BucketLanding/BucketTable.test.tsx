import { shallow } from 'enzyme';
import * as React from 'react';
import { buckets } from 'src/__data__/buckets';
import { BucketTable } from './BucketTable';

describe('BucketTable', () => {
  const wrapper = shallow(
    <BucketTable
      data={buckets}
      orderBy="label"
      order="asc"
      handleOrderChange={jest.fn()}
      openBucketDrawer={jest.fn()}
      handleClickRemove={jest.fn()}
      handleClickDetails={jest.fn()}
    />
  );

  const innerComponent = wrapper.dive();

  it('renders without crashing', () => {
    expect(wrapper).toHaveLength(1);
  });

  it('renders a "Name" column', () => {
    expect(innerComponent.find('[data-qa-name]')).toHaveLength(1);
  });
  it('renders a "Region" column', () => {
    expect(innerComponent.find('[data-qa-region]')).toHaveLength(1);
  });
  it('renders a "Created" column', () => {
    expect(innerComponent.find('[data-qa-created]')).toHaveLength(1);
  });
  it('renders a "Size" column', () => {
    expect(innerComponent.find('[data-qa-size]')).toHaveLength(1);
  });
  it('renders a RenderData component with the provided data', () => {
    expect(innerComponent.find('RenderData').prop('data')).toEqual(buckets);
  });
});
