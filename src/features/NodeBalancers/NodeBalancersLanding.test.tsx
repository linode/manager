import * as React from 'react';

import { StaticRouter, withRouter } from 'react-router-dom';

import { mount } from 'enzyme';

import { clearDocs, setDocs } from 'src/store/reducers/documentation';

import { createPromiseLoaderResponse } from 'src/utilities/testHelpers';

import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { NodeBalancersLanding as _NodeBalancersLanding } from './NodeBalancersLanding';

import {extendedNodeBalancers} from 'src/__data__/nodeBalancers';

describe('NodeBalancers', () => {
  const NodeBalancersLanding = withRouter(_NodeBalancersLanding);

  const nodeBalancersAsPromise = createPromiseLoaderResponse(extendedNodeBalancers)

  const component = mount(
    <StaticRouter context={{}}>
      <LinodeThemeWrapper>
        <NodeBalancersLanding
          classes={{ root: '', title: '', NBStatus: '' }}
          setDocs={setDocs}
          clearDocs={clearDocs}
          nodeBalancers={nodeBalancersAsPromise}
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

  it('should render a Kabob menu', () => {
    const kabobMenu = component.find('withRouter(NodeBalancerActionMenu)')
      .first();
    expect(kabobMenu).toHaveLength(1);
  });

  it('trigger a confirmation modal when delete is selected', () => {
    //
  });
});
