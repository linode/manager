import { shallow } from 'enzyme';
import * as React from 'react';

import TagsInput from './TagsInput';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { API_ROOT } from 'src/constants';

const mockApi = new MockAdapter(axios);
const API_REQUEST = `${API_ROOT}/tags`;

const mockTags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];

mockApi.onGet(API_REQUEST).reply(200, {
  data: mockTags.map(tag => ({ label: tag }))
});

describe('TagsInput', () => {
  const onChange = jest.fn();

  const component = shallow(
    <TagsInput
      value={['someTag', 'someOtherTag'].map(tag => ({
        value: tag,
        label: tag
      }))}
      onChange={onChange}
    />
  );

  it('sets account tags based on API request', () => {
    expect(component.state('accountTags')).toHaveLength(mockTags.length);
  });

  it('calls onChange handler when the value is updated', () => {
    const newValue = ['someTag', 'anotherTag', 'onMoreTag'].map(tag => ({
      value: tag,
      label: tag
    }));

    component.simulate('change', newValue);
    expect(onChange).toHaveBeenCalledWith(newValue);
  });
});
