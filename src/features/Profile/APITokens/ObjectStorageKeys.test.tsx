import { shallow } from 'enzyme';
import * as React from 'react';
import { ObjectStorageKeys } from './ObjectStorageKeys';

describe('ObjectStorageKeys', () => {
  const props = {
    classes: {
      headline: '',
      paper: '',
      helperText: '',
      labelCell: '',
      createdCell: '',
      confirmationDialog: ''
    }
  };
  const wrapper = shallow(<ObjectStorageKeys {...props} />);
  it('renders without crashing', () => {
    expect(wrapper).toHaveLength(1);
  });

  // @todo: Add more tests. (Enzyme hooks support? React-test-renderer? React-testing-library?)
});
