import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import _ from 'lodash';
import { formatDNSSeconds } from '~/domains/components/SelectDNSSeconds';
import { MasterZone } from '~/domains/components/MasterZone';
import { api } from '~/data';

const { domains } = api;

describe('domains/components/MasterZone', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('should render without error', () => {
    const dispatch = jest.fn();
    const currentZone = domains.domains[2];
    const wrapper = shallow(
      <MasterZone
        dispatch={dispatch}
        domain={{
          ...currentZone,
          _groupedRecords: _.groupBy(currentZone._records.records, 'type'),
        }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a domain with no records', () => {
    const currentZone = domains.domains[2];

    const wrapper = shallow(
      <MasterZone
        dispatch={dispatch}
        domain={{
          ...currentZone,
          _groupedRecords: _.groupBy(currentZone._records.records, 'type'),
        }}
      />
    );


    const srv = wrapper.find('Card#srv');

    const mx = wrapper.find('Card#mx');

    const cname = wrapper.find('Card#cname');

    const a = wrapper.find('Card#a');

    const txt = wrapper.find('Card#txt');


    expect(srv.length).toBe(1);
    expect(mx.length).toBe(1);
    expect(cname.length).toBe(1);
    expect(a.length).toBe(1);
    expect(txt.length).toBe(1);
  });

  it.skip('renders soa records', () => {
    const currentZone = domains.domains[1];

    const wrapper = shallow(
      <MasterZone
        dispatch={dispatch}
        domain={{
          ...currentZone,
          _groupedRecords: _.groupBy(currentZone._records.records, 'type'),
        }}
      />
    );

    const soaRow = wrapper.find('#soa .TableRow');
    expect(soaRow.length).toBe(1);

    const soaValues = soaRow.find('td');
    expect(soaValues.length).toBe(7);
    const fmt = (time, def) => shallow(formatDNSSeconds(time, def, true)).text();
    // Test all values in SOA row

    [
      currentZone.domain,
      currentZone.soa_email,
    ].forEach(
      (value, i) => expect(soaValues.at(i).text()).toBe(value));

    [
      fmt(currentZone.ttl_sec),
      fmt(currentZone.refresh_sec),
      fmt(currentZone.retry_sec),
      fmt(currentZone.expire_sec, 604800),
    ].forEach(
      (value, i) => expect(soaValues.at(i + 2).text()).toBe(value));
  });

  it.skip('renders ns records', () => {
    const currentZone = domains.domains[1];
    const nsRecords = Object.values(currentZone._records.records).filter(
      r => r.type === 'NS');

    const wrapper = shallow(
      <MasterZone
        dispatch={dispatch}
        domain={{
          ...currentZone,
          _groupedRecords: _.groupBy(currentZone._records.records, 'type'),
        }}
      />
    );

    const nsRows = wrapper.find('#ns .TableRow');
    expect(nsRows.length).toBe(5);
    const nsValues = nsRows.at(4).find('td');
    expect(nsValues.length).toBe(4);
    // Test all values in an NS row
    const nsRecord = nsRecords[0];
    [nsRecord.target, nsRecord.name || currentZone.domain]
      .forEach((value, i) => expect(nsValues.at(i).text()).toBe(value));
  });

  it.skip('renders mx records', () => {
    const currentZone = domains.domains[1];
    const mxRecords = Object.values(currentZone._records.records).filter(
      r => r.type === 'MX');

    const wrapper = shallow(
      <MasterZone
        dispatch={dispatch}
        domain={{
          ...currentZone,
          _groupedRecords: _.groupBy(currentZone._records.records, 'type'),
        }}
      />
    );

    const mxRows = wrapper.find('#mx .TableRow');
    expect(mxRows.length).toBe(mxRecords.length);

    const mxValues = mxRows.at(0).find('td');
    expect(mxValues.length).toBe(4);
    // Test all values in an MX row
    const mxRecord = mxRecords[0];
    [mxRecord.target, mxRecord.priority, mxRecord.name || currentZone.domain].forEach(
      (value, i) => expect(mxValues.at(i).text()).toBe(value.toString()));
  });

  it.skip('renders a records', () => {
    const currentZone = domains.domains[1];
    const aRecords = Object.values(currentZone._records.records).filter(
      r => ['A', 'AAAA'].indexOf(r.type) !== -1);

    const wrapper = shallow(
      <MasterZone
        dispatch={dispatch}
        domain={{
          ...currentZone,
          _groupedRecords: _.groupBy(currentZone._records.records, 'type'),
        }}
      />
    );

    const aRows = wrapper.find('#a .TableRow');
    expect(aRows.length).toBe(aRecords.length);

    const aValues = aRows.at(0).find('td');
    expect(aValues.length).toBe(4);
    // Test all values in a A/AAAA row
    const aRecord = aRecords[0];
    [aRecord.name, aRecord.target].forEach((value, i) =>
      expect(aValues.at(i).text()).toBe(value));
    expect(
      shallow(formatDNSSeconds(aRecord.ttl_sec, currentZone.ttl_sec, true)).text()
    ).toBe(aValues.at(2).text());
  });

  it.skip('renders cname records', () => {
    const currentZone = domains.domains[1];
    const cnameRecords = Object.values(currentZone._records.records).filter(
      r => r.type === 'CNAME');

    const wrapper = shallow(
      <MasterZone
        dispatch={dispatch}
        domain={{
          ...currentZone,
          _groupedRecords: _.groupBy(currentZone._records.records, 'type'),
        }}
      />
    );

    const cnameRows = wrapper.find('#cname .TableRow');
    expect(cnameRows.length).toBe(cnameRecords.length);

    const cnameValues = cnameRows.at(0).find('td');
    expect(cnameValues.length).toBe(4);
    // Test all values in a CNAME row
    const cnameRecord = cnameRecords[0];
    [cnameRecord.name, cnameRecord.target].forEach(
      (value, i) => expect(cnameValues.at(i).text()).toBe(value));
    expect(shallow(formatDNSSeconds(cnameRecord.ttl_sec, currentZone.ttl_sec, true)).text())
      .toBe(cnameValues.at(2).text());
  });

  it.skip('renders txt records', () => {
    const currentZone = domains.domains[1];
    const txtRecords = Object.values(currentZone._records.records).filter(
      r => r.type === 'TXT');

    const wrapper = shallow(
      <MasterZone
        dispatch={dispatch}
        domain={{
          ...currentZone,
          _groupedRecords: _.groupBy(currentZone._records.records, 'type'),
        }}
      />
    );

    const txtRows = wrapper.find('#txt .TableRow');
    expect(txtRows.length).toBe(txtRecords.length);

    const txtValues = txtRows.at(0).find('td');
    expect(txtValues.length).toBe(4);
    // Test all values in a TXT row
    const txtRecord = txtRecords[0];
    [txtRecord.name, txtRecord.target].forEach((value, i) =>
      expect(txtValues.at(i).text()).toBe(value));
    expect(shallow(formatDNSSeconds(txtRecord.ttl_sec, currentZone.ttl_sec, true)).text())
      .toBe(txtValues.at(2).text());
  });

  it.skip('renders srv records', () => {
    const currentZone = domains.domains[1];
    const srvRecords = Object.values(currentZone._records.records).filter(
      r => r.type === 'SRV');

    const wrapper = shallow(
      <MasterZone
        dispatch={dispatch}
        domain={{
          ...currentZone,
          _groupedRecords: _.groupBy(currentZone._records.records, 'type'),
        }}
      />
    );

    const srvRows = wrapper.find('#srv .TableRow');
    expect(srvRows.length).toBe(srvRecords.length);

    const srvValues = srvRows.at(0).find('td');
    expect(srvValues.length).toBe(8);
    // Test all values in a SRV row
    const srvRecord = srvRecords[0];

    [
      srvRecord.name,
      srvRecord.priority,
      currentZone.domain,
      srvRecord.weight,
      srvRecord.port,
      srvRecord.target,
    ].forEach(
      (value, i) => expect(srvValues.at(i).text()).toBe(value.toString()));

    expect(shallow(formatDNSSeconds(srvRecord.ttl_sec, currentZone.ttl_sec, true)).text())
      .toBe(srvValues.at(6).text());
  });
});
