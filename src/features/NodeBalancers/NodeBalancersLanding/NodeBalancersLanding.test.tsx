import { mount } from 'enzyme';
import * as React from 'react';
import { StaticRouter } from 'react-router-dom';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { NodeBalancersLanding } from './NodeBalancersLanding';

import { Provider } from 'react-redux';
import store from 'src/store';

describe.skip('NodeBalancers', () => {
  const component = mount(
    <StaticRouter context={{}}>
      <Provider store={store}>
        <LinodeThemeWrapper theme="dark" spacing="normal">
          <NodeBalancersLanding
            {...reactRouterProps}
            groupByTag={false}
            toggleGroupByTag={jest.fn()}
            nodeBalancersLoading={false}
            nodeBalancersError={undefined}
            nodeBalancersData={[]}
            nodeBalancersCount={0}
            classes={{
              root: '',
              title: '',
              nameCell: '',
              icon: '',
              nodeStatus: '',
              transferred: '',
              ports: '',
              ip: '',
              tagGroup: ''
            }}
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

  it('trigger a confirmation modal when delete is selected', () => {
    //
  });
});
