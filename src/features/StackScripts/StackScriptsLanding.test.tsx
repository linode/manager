import * as React from 'react';
import { mount } from 'enzyme';

import { StackScriptsLanding } from './StackScriptsLanding';
import { setDocs, clearDocs } from 'src/store/reducers/documentation';

describe('NodeBalancers', () => {

  const component = mount(
    <StackScriptsLanding
      classes={{
        root: '',
      }}
      setDocs={setDocs}
      clearDocs={clearDocs}
    />,
  );

  it('should render 3 header tabs', () => {
    const tabs = component.find('Tab');
    expect(tabs).toHaveLength(3);
  });

  it('should render 5 colums in a table', () => {
    const columns = component.find('TableHead > TableRow > TableCell');
    // expect(columns).toHaveLength(5);
  });

  it('should render a select component for filtering', () => {
    //
  });
});
