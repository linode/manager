import { mount } from 'enzyme';
import * as React from 'react';
import { StaticRouter, withRouter } from 'react-router-dom';

import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { clearDocs, setDocs } from 'src/store/reducers/documentation';

import { NodeBalancersLanding as _NodeBalancersLanding } from './NodeBalancersLanding';

describe.skip('NodeBalancers', () => {
  const NodeBalancersLanding = withRouter(_NodeBalancersLanding);

    const component = mount(
    <StaticRouter context={{}}>
      <LinodeThemeWrapper>
        <NodeBalancersLanding
          classes={{
            root: '',
            title: '',
            nameCell: '',
            nodeStatus: '',
            transferred: '',
            ports: '',
            ip: ''
          }}
          setDocs={setDocs}
          clearDocs={clearDocs}
        />
      </LinodeThemeWrapper>
    </StaticRouter>,
  );

  it('should render 7 columns', () => {
    const numOfColumns = component
      .find('WithStyles(TableHead)')
      .find('WithStyles(TableCell)')
      .length;
    expect(numOfColumns).toBe(7);
  });

  it.skip('should render a Kabob menu', () => {
    const kabobMenu = component.find('withRouter(NodeBalancerActionMenu)')
      .first();
    expect(kabobMenu).toHaveLength(1);
  });

  it('trigger a confirmation modal when delete is selected', () => {
    //
  });
});
