import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { api } from '@/data';
import { IndexPage } from '~/nodebalancers/nodebalancer/layouts/IndexPage';

const { nodebalancers } = api;

describe('nodebalancers/nodebalancer/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('displays nodebalancer configs', () => {
    const testNodebalancers = nodebalancers;
    const nbLabel = testNodebalancers.nodebalancers[0].label;
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        params={{ nbLabel }}
        nodebalancer={testNodebalancers.nodebalancers[0]}
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
    expect(renderedPort).to.equal('80');
    expect(renderedProtocol).to.equal('HTTP');
    expect(renderedAlgorithm).to.equal('Roundrobin');
    expect(renderedStick).to.equal('None');
    expect(renderedCheck).to.equal('None');
    expect(secondRenderedPort).to.equal('81');
  });
});

