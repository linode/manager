import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import store from 'src/store';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { NodeBalancersLanding } from './NodeBalancersLanding';

describe.skip('NodeBalancers', () => {
  const component = mount(
    <StaticRouter context={{}}>
      <Provider store={store}>
        <LinodeThemeWrapper theme="dark">
          <NodeBalancersLanding
            {...reactRouterProps}
            nodeBalancersLoading={false}
            nodeBalancersError={undefined}
            nodeBalancersData={[]}
            nodeBalancersLastUpdated={0}
            nodeBalancersCount={0}
            nodeBalancerActions={{
              updateNodeBalancer: jest.fn(),
              createNodeBalancer: jest.fn(),
              deleteNodeBalancer: jest.fn(),
              getAllNodeBalancers: jest.fn(),
              getAllNodeBalancersWithConfigs: jest.fn(),
              getNodeBalancerPage: jest.fn(),
              getNodeBalancerWithConfigs: jest.fn(),
            }}
            setDocs={jest.fn()}
            clearDocs={jest.fn()}
          />
        </LinodeThemeWrapper>
      </Provider>
    </StaticRouter>
  );

  it('should render 7 columns', () => {
    const numOfColumns = component
      .find('WithStyles(TableHead)')
      .find('WithStyles(TableCell)').length;
    expect(numOfColumns).toBe(7);
  });

  it.skip('should render a Kabob menu', () => {
    const kabobMenu = component
      .find('withRouter(NodeBalancerActionMenu)')
      .first();
    expect(kabobMenu).toHaveLength(1);
  });
});
