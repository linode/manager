import { shallow } from 'enzyme';
import * as React from 'react';

import { InfoPanel } from './LabelAndTagsPanel';

const onLabelChange = () => jest.fn();
const onTagsChange = () => jest.fn();

describe('Tags list', () => {
  it('should render tags input if tagsInputProps are specified', () => {
    const component = shallow(
      <InfoPanel
        labelFieldProps={{
          label: 'Linode Label',
          value: '',
          onChange: onLabelChange,
          errorText: 'Your label is rude!'
        }}
        tagsInputProps={{
          value: ['a', 'b'].map(tag => ({ label: tag, value: tag })),
          onChange: onTagsChange,
          tagError: 'Tag names are too short!'
        }}
        classes={{
          root: '',
          inner: '',
          expPanelButton: ''
        }}
      />
    );
    expect(component.find('TagsInput')).toHaveLength(1);
  });

  it('should NOT render tags input if tagsInputProps are NOT specified', () => {
    const component = shallow(
      <InfoPanel
        labelFieldProps={{
          label: 'Linode Label',
          value: '',
          onChange: onLabelChange,
          errorText: 'Your label is rude!'
        }}
        classes={{
          root: '',
          inner: '',
          expPanelButton: ''
        }}
      />
    );
    expect(component.find('TagsInput')).toHaveLength(0);
  });
});
