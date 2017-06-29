import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import _ from 'lodash';
import { formatDNSSeconds } from '~/domains/components/SelectDNSSeconds';
import { MasterZone } from '~/domains/components/MasterZone';
import { api } from '@/data';

const { domains } = api;

describe('domains/components/MasterZone', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a domain with no records', () => {
    const currentZone = domains.domains[2];

    const page = mount(
      <MasterZone
        dispatch={dispatch}
        domain={{
          ...currentZone,
          _groupedRecords: _.groupBy(currentZone._records.records, 'type'),
        }}
      />
    );

    const srv = page.find('#srv');
    const mx = page.find('#mx');
    const cname = page.find('#cname');
    const a = page.find('#a');
    const txt = page.find('#txt');

    expect(srv.find('p').text()).to.equal('You have no SRV records.');
    expect(mx.find('p').text()).to.equal('You have no MX records.');
    expect(cname.find('p').text()).to.equal('You have no CNAME records.');
    expect(a.find('p').text()).to.equal('You have no A/AAAA records.');
    expect(txt.find('p').text()).to.equal('You have no TXT records.');
  });

  it('renders soa records', () => {
    const currentZone = domains.domains[1];

    const page = mount(
      <MasterZone
        dispatch={dispatch}
        domain={{
          ...currentZone,
          _groupedRecords: _.groupBy(currentZone._records.records, 'type'),
        }}
      />
    );

    const soaRow = page.find('#soa .TableRow');
    expect(soaRow.length).to.equal(1);

    const soaValues = soaRow.find('td');
    expect(soaValues.length).to.equal(7);
    const fmt = (time, def) => mount(formatDNSSeconds(time, def, true)).text();
    // Test all values in SOA row
    [currentZone.domain, currentZone.soa_email].forEach(
      (value, i) => expect(soaValues.at(i).text()).to.equal(value));
    [fmt(currentZone.ttl_sec), fmt(currentZone.refresh_sec), fmt(currentZone.retry_sec),
     fmt(currentZone.expire_sec, 604800)].forEach(
       (value, i) => expect(soaValues.at(i + 2).text()).to.equal(value));
  });

  it('renders ns records', () => {
    const currentZone = domains.domains[1];
    const nsRecords = Object.values(currentZone._records.records).filter(
      r => r.type === 'NS');

    const page = mount(
      <MasterZone
        dispatch={dispatch}
        domain={{
          ...currentZone,
          _groupedRecords: _.groupBy(currentZone._records.records, 'type'),
        }}
      />
    );

    const nsRows = page.find('#ns .TableRow');
    expect(nsRows.length).to.equal(5);
    const nsValues = nsRows.at(4).find('td');
    expect(nsValues.length).to.equal(4);
    // Test all values in an NS row
    const nsRecord = nsRecords[0];
    [nsRecord.target, nsRecord.name || currentZone.domain]
      .forEach((value, i) => expect(nsValues.at(i).text()).to.equal(value));
  });

  it('renders mx records', () => {
    const currentZone = domains.domains[1];
    const mxRecords = Object.values(currentZone._records.records).filter(
      r => r.type === 'MX');

    const page = mount(
      <MasterZone
        dispatch={dispatch}
        domain={{
          ...currentZone,
          _groupedRecords: _.groupBy(currentZone._records.records, 'type'),
        }}
      />
    );

    const mxRows = page.find('#mx .TableRow');
    expect(mxRows.length).to.equal(mxRecords.length);

    const mxValues = mxRows.at(0).find('td');
    expect(mxValues.length).to.equal(5);
    // Test all values in an MX row
    const mxRecord = mxRecords[0];
    [mxRecord.target, mxRecord.priority, mxRecord.name || currentZone.domain].forEach(
      (value, i) => expect(mxValues.at(i).text()).to.equal(value.toString()));
  });

  it('renders a records', () => {
    const currentZone = domains.domains[1];
    const aRecords = Object.values(currentZone._records.records).filter(
      r => ['A', 'AAAA'].indexOf(r.type) !== -1);

    const page = mount(
      <MasterZone
        dispatch={dispatch}
        domain={{
          ...currentZone,
          _groupedRecords: _.groupBy(currentZone._records.records, 'type'),
        }}
      />
    );

    const aRows = page.find('#a .TableRow');
    expect(aRows.length).to.equal(aRecords.length);

    const aValues = aRows.at(0).find('td');
    expect(aValues.length).to.equal(5);
    // Test all values in a A/AAAA row
    const aRecord = aRecords[0];
    [aRecord.name, aRecord.target].forEach((value, i) =>
      expect(aValues.at(i).text()).to.equal(value));
    expect(mount(formatDNSSeconds(aRecord.ttl_sec, currentZone.ttl_sec, true)).text()
      ).to.equal(aValues.at(2).text());
  });

  it('renders cname records', () => {
    const currentZone = domains.domains[1];
    const cnameRecords = Object.values(currentZone._records.records).filter(
      r => r.type === 'CNAME');

    const page = mount(
      <MasterZone
        dispatch={dispatch}
        domain={{
          ...currentZone,
          _groupedRecords: _.groupBy(currentZone._records.records, 'type'),
        }}
      />
    );

    const cnameRows = page.find('#cname .TableRow');
    expect(cnameRows.length).to.equal(cnameRecords.length);

    const cnameValues = cnameRows.at(0).find('td');
    expect(cnameValues.length).to.equal(5);
    // Test all values in a CNAME row
    const cnameRecord = cnameRecords[0];
    [cnameRecord.name, cnameRecord.target].forEach(
      (value, i) => expect(cnameValues.at(i).text()).to.equal(value));
    expect(mount(formatDNSSeconds(cnameRecord.ttl_sec, currentZone.ttl_sec, true)).text())
      .to.equal(cnameValues.at(2).text());
  });

  it('renders txt records', () => {
    const currentZone = domains.domains[1];
    const txtRecords = Object.values(currentZone._records.records).filter(
      r => r.type === 'TXT');

    const page = mount(
      <MasterZone
        dispatch={dispatch}
        domain={{
          ...currentZone,
          _groupedRecords: _.groupBy(currentZone._records.records, 'type'),
        }}
      />
    );

    const txtRows = page.find('#txt .TableRow');
    expect(txtRows.length).to.equal(txtRecords.length);

    const txtValues = txtRows.at(0).find('td');
    expect(txtValues.length).to.equal(5);
    // Test all values in a TXT row
    const txtRecord = txtRecords[0];
    [txtRecord.name, txtRecord.target].forEach((value, i) =>
      expect(txtValues.at(i).text()).to.equal(value));
    expect(mount(formatDNSSeconds(txtRecord.ttl_sec, currentZone.ttl_sec, true)).text())
      .to.equal(txtValues.at(2).text());
  });

  it('renders srv records', () => {
    const currentZone = domains.domains[1];
    const srvRecords = Object.values(currentZone._records.records).filter(
      r => r.type === 'SRV');

    const page = mount(
      <MasterZone
        dispatch={dispatch}
        domain={{
          ...currentZone,
          _groupedRecords: _.groupBy(currentZone._records.records, 'type'),
        }}
      />
    );

    const srvRows = page.find('#srv .TableRow');
    expect(srvRows.length).to.equal(srvRecords.length);

    const srvValues = srvRows.at(0).find('td');
    expect(srvValues.length).to.equal(9);
    // Test all values in a SRV row
    const srvRecord = srvRecords[0];
    [srvRecord.name, srvRecord.priority, currentZone.domain, srvRecord.weight, srvRecord.port,
     srvRecord.target].forEach(
       (value, i) => expect(srvValues.at(i).text()).to.equal(value.toString()));
    expect(mount(formatDNSSeconds(srvRecord.ttl_sec, currentZone.ttl_sec, true)).text())
      .to.equal(srvValues.at(6).text());
  });
});
