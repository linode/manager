import { shallow } from 'enzyme';
import * as React from 'react';

import { StackScriptForm } from './StackScriptForm';

import { images } from 'src/__data__/images';

describe('StackScriptCreate', () => {
  const component = shallow(
    <StackScriptForm
      classes={{
        titleWrapper: '',
        root: '',
        backButton: '',
        createTitle: '',
        labelField: '',
        divider: '',
        gridWithTips: '',
        tips: '',
        chipsContainer: '',
        scriptTextarea: '',
        revisionTextarea: '',
        warning: '',
        targetTag: ''
      }}
      images={{
        available: images,
        selected: [],
        handleRemove: jest.fn(),
      }}
      currentUser='mmckenna'
      label={{
        value: '',
        handler: jest.fn()
      }}
      description={{
        value: '',
        handler: jest.fn()
      }}
      revision={{
        value: '',
        handler: jest.fn()
      }}
      script={{
        value: '',
        handler: jest.fn()
      }}
      selectImages={{
        open: false,
        onOpen: jest.fn(),
        onClose: jest.fn(),
        onChange: jest.fn()
      }}
      errors={[]}
      onSubmit={jest.fn()}
      onCancel={jest.fn()}
      isSubmitting={false}
    />
  );

  it('should render three text fields', () => {
    expect(component.find('WithStyles(LinodeTextField)')).toHaveLength(4);
  });

  it('should render a select field', () => {
    expect(component.find('WithStyles(SSelect)')).toHaveLength(1);
  });

  it('should render a code text field', () => {
    // not done yet!!
  });
});