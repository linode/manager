import { shallow } from 'enzyme';
import * as React from 'react';

import { ScriptCode } from './ScriptCode';

describe('ScriptCode', () => {
  it('should render multiple lines of code if there are line breaks', () => {
    const component = shallow(
      <ScriptCode
        script={
          'This is my custom script to display\nNew line\nAnother New Line'
        }
        classes={{
          root: '',
          container: '',
          table: '',
          row: '',
          numberCell: '',
          codeCell: '',
          code: ''
        }}
      />
    );

    expect(component.find('pre')).toHaveLength(3);
  });
});
