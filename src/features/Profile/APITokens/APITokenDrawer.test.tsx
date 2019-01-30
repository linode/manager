import { shallow } from 'enzyme';
import * as React from 'react';

import { APITokenDrawer } from './APITokenDrawer';

describe('API Token Drawer', () => {
  const component = shallow<APITokenDrawer>(
    <APITokenDrawer
      classes={{
        permsTable: '',
        selectCell: '',
        accessCell: '',
        noneCell: '',
        readOnlyCell: '',
        readWritecell: ''
      }}
      open={true}
      mode="create"
      closeDrawer={jest.fn()}
      onChange={jest.fn()}
      onCreate={jest.fn()}
      onEdit={jest.fn()}
    />
  );

  it('scope permissions should be the same if "select all" radio is clicked', () => {
    const selectAllBtn = component.find(
      'WithStyles(LinodeRadioControl)[value="1"][name="Select All"]'
    );
    // "value" could not be found on "currentTarget,"
    // so we needed to manually make inject that value
    selectAllBtn.simulate('change', { currentTarget: { value: '2' } });
    const allScopesIndenticalToSelectAll = component
      .state()
      .scopes.every((scope: [string, number]) => {
        // the selectAll value that was selected was 2, so all the scopes should be 2
        return scope[1] === 2;
      });
    expect(allScopesIndenticalToSelectAll).toBeTruthy();
  });
});
