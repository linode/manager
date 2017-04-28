import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { genericNodeBalancer } from '@/data/nodebalancers';
import { ViewConfigPage } from '~/nodebalancers/nodebalancer/configs/layouts/ViewConfigPage';

describe('nodebalancers/nodebalancer/configs/layouts/ViewConfigPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.stub();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('displays the config view summary', async () => {
    const page = await mount(
      <ViewConfigPage
        config={genericNodeBalancer._configs.configs[0]}
        nodebalancer={genericNodeBalancer}
      />
    );
    const port = page.find('.Card-body .row .col-sm-10').at(0).text();
    const portFromApi = genericNodeBalancer._configs.configs[0].port;
    const nodesFromApi = genericNodeBalancer._configs.configs[0]._nodes.nodes;
    expect(parseInt(port)).to.equal(portFromApi);
    const nodeRows = page.find('.TableRow');
    const nodeValues = nodeRows.at(0).find('td');
    expect(nodeValues.length).to.equal(6);
    [
      nodesFromApi[0].label,
      nodesFromApi[0].address,
      nodesFromApi[0].weight,
      nodesFromApi[0].mode,
      nodesFromApi[0].status,
    ].forEach((value, i) => {
      expect(value.toString()).to.equal(nodeValues.at(i).text());
    });
  });
});
