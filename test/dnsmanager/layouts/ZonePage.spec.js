import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { formatDNSSeconds } from '~/dnsmanager/components/SelectDNSSeconds';
import { ZonePage } from '~/dnsmanager/layouts/ZonePage';
import { api } from '@/data';

const { dnszones } = api;

describe('dnsmanager/layouts/ZonePage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a zone with no records', () => {
    const currentZone = dnszones.dnszones[2];

    const page = mount(
      <ZonePage
        dispatch={dispatch}
        params={{ dnszoneLabel: currentZone.dnszone }}
        dnszones={dnszones}
      />
    );

    const srv = page.find('#srv');
    const mx = page.find('#mx');
    const cname = page.find('#cname');
    const a = page.find('#a');
    const txt = page.find('#txt');

    [srv, mx, cname, a, txt].forEach(section =>
      expect(section.find('p').text()).to.equal('No records found.'));
  });

  it('renders soa records', () => {
    const currentZone = dnszones.dnszones[1];

    const page = mount(
      <ZonePage
        dispatch={dispatch}
        params={{ dnszoneLabel: currentZone.dnszone }}
        dnszones={dnszones}
      />
    );

    const soaRow = page.find('#soa .TableRow');
    expect(soaRow.length).to.equal(1);

    const soaValues = soaRow.find('td');
    expect(soaValues.length).to.equal(7);
    const fmt = formatDNSSeconds;
    // Test all values in SOA row
    [currentZone.dnszone, currentZone.soa_email, fmt(currentZone.ttl_sec),
     fmt(currentZone.refresh_sec), fmt(currentZone.retry_sec),
     fmt(currentZone.expire_sec, 604800)].forEach(
       (value, i) => expect(soaValues.at(i).text()).to.equal(value));
  });

  it('renders ns records', () => {
    const currentZone = dnszones.dnszones[1];
    const nsRecords = Object.values(currentZone._records.records).filter(
      r => r.type === 'NS');

    const page = mount(
      <ZonePage
        dispatch={dispatch}
        params={{ dnszoneLabel: currentZone.dnszone }}
        dnszones={dnszones}
      />
    );

    const nsRows = page.find('#ns .TableRow');
    expect(nsRows.length).to.equal(5);
    const nsValues = nsRows.at(4).find('td');
    expect(nsValues.length).to.equal(4);
    // Test all values in an NS row
    const nsRecord = nsRecords[0];
    [nsRecord.target, nsRecord.name || currentZone.dnszone,
      '86400 (1 day)'].forEach((value, i) => expect(nsValues.at(i).text()).to.equal(value));
  });

  it('renders mx records', () => {
    const currentZone = dnszones.dnszones[1];
    const mxRecords = Object.values(currentZone._records.records).filter(
      r => r.type === 'MX');

    const page = mount(
      <ZonePage
        dispatch={dispatch}
        params={{ dnszoneLabel: currentZone.dnszone }}
        dnszones={dnszones}
      />
    );

    const mxRows = page.find('#mx .TableRow');
    expect(mxRows.length).to.equal(mxRecords.length);

    const mxValues = mxRows.at(0).find('td');
    expect(mxValues.length).to.equal(5);
    // Test all values in an MX row
    const mxRecord = mxRecords[0];
    [mxRecord.target, mxRecord.priority, mxRecord.name || currentZone.dnszone].forEach(
      (value, i) => expect(mxValues.at(i).text()).to.equal(value.toString()));
  });

  it('renders a records', () => {
    const currentZone = dnszones.dnszones[1];
    const aRecords = Object.values(currentZone._records.records).filter(
      r => ['A', 'AAAA'].indexOf(r.type) !== -1);

    const page = mount(
      <ZonePage
        dispatch={dispatch}
        params={{ dnszoneLabel: currentZone.dnszone }}
        dnszones={dnszones}
      />
    );

    const aRows = page.find('#a .TableRow');
    expect(aRows.length).to.equal(aRecords.length);

    const aValues = aRows.at(0).find('td');
    expect(aValues.length).to.equal(5);
    // Test all values in a A/AAAA row
    const aRecord = aRecords[0];
    [aRecord.name, aRecord.target, formatDNSSeconds(aRecord.ttl_sec, currentZone.ttl_sec),
    ].forEach((value, i) => expect(aValues.at(i).text()).to.equal(value));
  });

  it('renders cname records', () => {
    const currentZone = dnszones.dnszones[1];
    const cnameRecords = Object.values(currentZone._records.records).filter(
      r => r.type === 'CNAME');

    const page = mount(
      <ZonePage
        dispatch={dispatch}
        params={{ dnszoneLabel: currentZone.dnszone }}
        dnszones={dnszones}
      />
    );

    const cnameRows = page.find('#cname .TableRow');
    expect(cnameRows.length).to.equal(cnameRecords.length);

    const cnameValues = cnameRows.at(0).find('td');
    expect(cnameValues.length).to.equal(5);
    // Test all values in a CNAME row
    const cnameRecord = cnameRecords[0];
    [cnameRecord.name, cnameRecord.target,
     formatDNSSeconds(cnameRecord.ttl_sec, currentZone.ttl_sec)].forEach((value, i) =>
       expect(cnameValues.at(i).text()).to.equal(value));
  });

  it('renders txt records', () => {
    const currentZone = dnszones.dnszones[1];
    const txtRecords = Object.values(currentZone._records.records).filter(
      r => r.type === 'TXT');

    const page = mount(
      <ZonePage
        dispatch={dispatch}
        params={{ dnszoneLabel: currentZone.dnszone }}
        dnszones={dnszones}
      />
    );

    const txtRows = page.find('#txt .TableRow');
    expect(txtRows.length).to.equal(txtRecords.length);

    const txtValues = txtRows.at(0).find('td');
    expect(txtValues.length).to.equal(5);
    // Test all values in a TXT row
    const txtRecord = txtRecords[0];
    [txtRecord.name, txtRecord.target, formatDNSSeconds(txtRecord.ttl_sec, currentZone.ttl_sec),
    ].forEach((value, i) => {
      expect(txtValues.at(i).text()).to.equal(value);
    });
  });

  it('renders srv records', () => {
    const currentZone = dnszones.dnszones[1];
    const srvRecords = Object.values(currentZone._records.records).filter(
      r => r.type === 'SRV');

    const page = mount(
      <ZonePage
        dispatch={dispatch}
        params={{ dnszoneLabel: currentZone.dnszone }}
        dnszones={dnszones}
      />
    );

    const srvRows = page.find('#srv .TableRow');
    expect(srvRows.length).to.equal(srvRecords.length);

    const srvValues = srvRows.at(0).find('td');
    expect(srvValues.length).to.equal(9);
    // Test all values in a SRV row
    const srvRecord = srvRecords[0];
    [srvRecord.name, srvRecord.priority, currentZone.dnszone, srvRecord.weight, srvRecord.port,
     srvRecord.target, formatDNSSeconds(srvRecord.ttl_sec, currentZone.ttl_sec),
    ].forEach((value, i) => expect(srvValues.at(i).text()).to.equal(value.toString()));
  });
});
