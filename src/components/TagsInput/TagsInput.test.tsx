import { mount } from 'enzyme';
import * as React from 'react';

import TagsInput from './TagsInput';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

import  axios from 'axios';
import  MockAdapter from 'axios-mock-adapter';

import { API_ROOT } from 'src/constants';

const mockApi = new MockAdapter(axios);
const API_REQUEST = `${API_ROOT}/tags`;

mockApi.onGet(API_REQUEST).reply(200, {
  data: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'].map(tag => ({label: tag}))
});

describe('TagsInput', () => {
  const onChange = jest.fn();

  const component = mount(
    <LinodeThemeWrapper>
      <TagsInput
        value={['someTag', 'someOtherTag'].map(tag => ({value: tag, label: tag}))}
        onChange={onChange}
      />
    </LinodeThemeWrapper>
  );

  const TagsInputComponent = component.find("TagsInput");

  it('should call provided render function with items.', () => {
    
    // TagsInputComponent.simulate("click");
    // TagsInputComponent.simulate("change", { value: ['someTag'].map(tag => ({value: tag, label: tag})) });
    TagsInputComponent.find('input').forEach(el => { el.simulate("keyDown", { keyCode: 84 }) });
    TagsInputComponent.find('input').forEach(el => { el.simulate("keyDown", { keyCode: 13 }) });
    
    console.log(TagsInputComponent.props());
    console.log(TagsInputComponent.state());
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
  });
});
