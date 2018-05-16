import * as React from 'react';
import { shallow } from 'enzyme';

import { APITokenDrawer } from './APITokenDrawer';

describe('API Token Drawer', () => {
  const component = shallow(
    <APITokenDrawer
      classes={{
        permsTable: '',
        accessCell: '',
        noneCell: '',
        readOnlyCell: '',
        readWritecell: '',
      }}
      open={true}
      mode="create"
      closeDrawer={jest.fn()}
      onChange={jest.fn()}
      onCreate={jest.fn()}
      onEdit={jest.fn()}
    />,
  );

  it('scope permissions should be the same if "select all" radio is clicked', () => {
    const selectAllBtn = component
      .find('WithStyles(LinodeRadioControl)[value="1"][name="Select All"]');
    selectAllBtn.simulate('change', { currentTarget: { value: '2' } });
    const allScopesIndenticalToSelectAll =
      component.state().scopes.every((scope: [string, number]) => {
        return scope[1] === 2;
      });
    expect(allScopesIndenticalToSelectAll).toBeTruthy();
  });
});
