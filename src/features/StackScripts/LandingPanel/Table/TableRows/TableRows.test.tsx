import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';

import { stackScripts as mockStackScripts } from 'src/__data__/stackScripts';

import { StackScriptTableRows, stripImageName } from './TableRows';

let component: ShallowWrapper<any, any>;

beforeAll(() => {
  component = shallow(
    <StackScriptTableRows
      classes={{
        root: ''
      }}
      currentUser="mmckenna"
      triggerDelete={jest.fn()}
      triggerMakePublic={jest.fn()}
      isRestrictedUser={false}
      stackScriptGrants={[]}
      stackScript={{
        loading: false,
        stackScripts: mockStackScripts
      }}
      category="community"
    />
  );
});

describe('StackScript Table Rows', () => {
  it('should render 2 rows', () => {
    expect(component.find('WithStyles(withRouter(TableRow))')).toHaveLength(2);
  });

  it('the first row should render 3 tags', () => {
    const firstRow = component
      .find('WithStyles(WrappedTableCell)[parentColumn="Compatible Images"]')
      .first();
    expect(firstRow.find('WithStyles(withRouter(Tag))')).toHaveLength(3);
  });

  it('the second row should render 3 tags and a "Show More" button', () => {
    const secondRow = component
      .find('WithStyles(WrappedTableCell)[parentColumn="Compatible Images"]')
      .at(1);
    expect(secondRow.find('WithStyles(withRouter(Tag))')).toHaveLength(3);
    expect(secondRow.find('WithStyles(ShowMore)')).toHaveLength(1);
  });

  describe('Utility functions', () => {
    it('stripImageName() should return centos7 ', () => {
      const cleanedName = stripImageName('linode/centos7');
      expect(cleanedName).toBe('centos7');
    });
  });
});
