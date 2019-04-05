import { shallow } from 'enzyme';
import * as React from 'react';
import { CreateBucketForm } from './CreateBucketForm';

describe('CreateBucketForm', () => {
  const wrapper = shallow(
    <CreateBucketForm
      onClose={jest.fn()}
      onSuccess={jest.fn()}
      createBucket={jest.fn()}
      classes={{ root: '', textWrapper: '' }}
    />
  );

  it('should render without crashing', () => {
    expect(wrapper).toHaveLength(1);
  });

  it('initializes form with blank values', () => {
    expect(wrapper.find('Formik').prop('initialValues')).toEqual({
      label: '',
      cluster: ''
    });
  });
});
