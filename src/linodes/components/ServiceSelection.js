import React, { Component } from 'react';
import _ from 'underscore';
import { toggleAllPlans } from '../actions/create';
import Service from './Service';

const test_services = [
  {
    label: "Linode 1024",
    ram: 1024,
    mbits_out: 25,
    disk: 24,
    id: "service_112",
    vcpus: 1,
    monthly_price: 1000,
    transfer: 2000,
    hourly_price: 1
  },
  {
    label: "Linode 2048",
    ram: 2048,
    mbits_out: 250,
    disk: 48,
    id: "service_113",
    vcpus: 2,
    monthly_price: 2000,
    transfer: 3000,
    hourly_price: 3
  },
  {
    label: "Linode 4096",
    ram: 4096,
    mbits_out: 500,
    disk: 96,
    id: "service_114",
    vcpus: 4,
    monthly_price: 4000,
    transfer: 4000,
    hourly_price: 6
  },
  {
    label: "Linode 8192",
    ram: 8192,
    mbits_out: 1000,
    disk: 192,
    id: "service_115",
    vcpus: 6,
    monthly_price: 8000,
    transfer: 8000,
    hourly_price: 12
  },
  {
    label: "Linode 16384",
    ram: 16384,
    mbits_out: 2000,
    disk: 384,
    id: "service_116",
    vcpus: 8,
    monthly_price: 16000,
    transfer: 16000,
    hourly_price: 24
  },
  {
    label: "Linode 32768",
    ram: 32768,
    mbits_out: 4000,
    disk: 768,
    id: "service_117",
    vcpus: 12,
    monthly_price: 32000,
    transfer: 20000,
    hourly_price: 48
  },
  {
    label: "Linode 49152",
    ram: 49152,
    mbits_out: 6000,
    disk: 1152,
    id: "service_118",
    vcpus: 16,
    monthly_price: 48000,
    transfer: 20000,
    hourly_price: 72
  },
  {
    label: "Linode 65536",
    ram: 65536,
    mbits_out: 8000,
    disk: 1536,
    id: "service_119",
    vcpus: 20,
    monthly_price: 64000,
    transfer: 20000,
    hourly_price: 96
  },
  {
    label: "Linode 98304",
    ram: 98304,
    mbits_out: 10000,
    disk: 1920,
    id: "service_120",
    vcpus: 20,
    monthly_price: 96000,
    transfer: 20000,
    hourly_price: 144
  }
];

export default class ServiceSelection extends Component {
  constructor() {
    super();
    this.render = this.render.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderBack = this.renderBack.bind(this);
  }

  renderBack() {
    const { onBack, ui } = this.props;
    if (ui.service === null) {
      return <a href="#" className="back pull-right"
        onClick={e => { e.preventDefault(); onBack() }}>Back</a>;
    }
  }

  renderHeader() {
    const { ui, services } = this.props;
    if (ui.service === null) {
      return <h2>Select a Plan</h2>;
    } else {
      const s = services.find(s => s.id == ui.service);
      return <h2 className="text-right">
        {s.label}
        <span className="dodsoncube" width="24" height="24"></span>
      </h2>;
    }
  }

  render() {
    const { onSelection, ui, dispatch } = this.props;

    if (ui.datacenter === null) {
      return <div></div>;
    }

    const services = ui.showAllPlans ? /*this.props.services*/
      test_services : test_services.slice(0, 4);

    if (ui.service !== null) {
      return <div className="card creation-step step-done">
        {this.renderBack()}
        {this.renderHeader()}
      </div>;
    }

    return (
      <div className="card creation-step">
        {this.renderBack()}
        {this.renderHeader()}
        <div className="service-list">
          {services.map(s => <Service
                 key={s.id}
                 onSelection={onSelection}
                 service={s} />)}
        </div>
        <button className="btn btn-success btn-block"
          onClick={() => dispatch(toggleAllPlans())}>
          {ui.showAllPlans ? 'Show Fewer' : 'Show More'}
        </button>
      </div>
    );
  }
}
