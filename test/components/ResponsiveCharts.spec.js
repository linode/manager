import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { ResponsiveLineChart } from '~/components/ResponsiveCharts';
import _ from 'lodash';

describe('components/ResponsiveCharts', async () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  describe('responsive line chart', () => {
    const now = new Date('July 24, 2016 11:13:00');
    const range = _.range(now - (1000 * 60 * 60 * 24 * 1), now, 5 * 60 * 1000);
    const chart = {
      data: [{
        name: 'Chart Name',
        values: range.map(ts => ({ x: ts, y: Math.random() * 50 })),
        strokeWidth: 2,
      }],
    };

    const graph = mount(
      <ResponsiveLineChart
        yAxisLabel={'Y Label'}
        xAxisLabel={'X Label'}
        xAccessor={d => new Date(d.x)}
        data={chart.data}
        domain={{ y: [0, 60] }}
        gridHorizontal
      />
    );

    it('renders y label', () => {
      expect(graph.find('g').at(0).find('g')
        .at(0)
        .find('g')
        .at(0)
        .find('text')
        .last()
        .text()).to.equal('Y Label');
    });

    it('renders x label', () => {
      expect(graph.find('g').at(0).find('g')
        .at(0)
        .find('g')
        .at(1)
        .find('text')
        .last()
        .text()).to.equal('X Label');
    });

    it('renders x axis intervals', () => {
      let axisInt = graph.find('g').at(1).text();
      axisInt = axisInt.replace('X Label', '');

      expect(axisInt).to.equal('12 PM03 PM06 PM09 PMJul 2403 AM06 AM09 AM');
    });

    it('renders y axis intervals', () => {
      let axisInt = graph.find('g').at(0).text();
      axisInt = axisInt.replace(graph.find('g').at(1).text(), '');
      axisInt = axisInt.replace('Y Label', '');

      expect(axisInt).to.equal('051015202530354045505560');
    });
  });
});
