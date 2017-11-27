import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';

import { configsNodeBalancer } from '~/data/nodebalancers';
import { DashboardPage } from '~/nodebalancers/nodebalancer/layouts/DashboardPage';

describe('nodebalancers/nodebalancer/layouts/DashboardPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('displays nodebalancer configs', () => {
    const page = mount(
      <DashboardPage
        dispatch={dispatch}
        nodebalancer={configsNodeBalancer}
        transfer={{ used: 1, quota: 5 }}
      />
    );
    const firstRow = page.find('tr').at(1);
    const secondRow = page.find('tr').at(2);
    const renderedPort = firstRow.find('td').at(0).text();
    const renderedProtocol = firstRow.find('td').at(1).text();
    const renderedAlgorithm = firstRow.find('td').at(2).text();
    const renderedStick = firstRow.find('td').at(3).text();
    const renderedCheck = firstRow.find('td').at(4).text();
    const secondRenderedPort = secondRow.find('td').at(0).text();
    expect(renderedPort).toBe('80');
    expect(renderedProtocol).toBe('HTTP');
    expect(renderedAlgorithm).toBe('Round Robin');
    expect(renderedStick).toBe('-- None --');
    expect(renderedCheck).toBe('1 up, 0 down');
    expect(secondRenderedPort).toBe('81');
  });
});

