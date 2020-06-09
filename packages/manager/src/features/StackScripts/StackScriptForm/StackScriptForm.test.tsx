import { shallow } from 'enzyme';
import * as React from 'react';

import { StackScriptForm } from './StackScriptForm';

import { normalizedImages as images } from 'src/__data__/images';

describe.skip('StackScriptCreate', () => {
  const component = shallow(
    <StackScriptForm
      images={{
        available: images,
        selected: []
      }}
      currentUser="mmckenna"
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
      onSelectChange={jest.fn()}
      errors={[]}
      onSubmit={jest.fn()}
      onCancel={jest.fn()}
      isSubmitting={false}
    />
  );

  it('should render', () => {
    expect(component).toHaveLength(1);
  });

  it('should render a select field', () => {
    expect(component.find('[data-qa-stackscript-target-select]')).toHaveLength(
      1
    );
  });
});
