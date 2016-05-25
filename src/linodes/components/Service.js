import React, { Component } from 'react';

export default class Service extends Component {
  constructor() {
    super();
    this.render = this.render.bind(this);
  }

  bandwidthString(mbps) {
    if (mbps >= 1000) {
      return `${mbps / 1000} Gbps`;
    }
    return `${mbps} Mbps`;
  }

  render() {
    const { service, onSelection } = this.props;
    return (
      <div key={service.id} onClick={() => onSelection(service.id)}
        className="service"
      >
        <h2>{service.label}</h2>
        <h3>${service.hourly_price / 100}/hr</h3>
        <h4>(${service.monthly_price / 100}/mo)</h4>
        <hr />
        <ul className="list-unstyled">
            <li>{Math.floor(service.ram / 1024)} GB RAM</li>
            <li>{service.vcpus} CPU Core{service.vcpus > 1 ? 's' : ''}</li>
            <li>{service.disk} GB SSD Storage</li>
            <li>{service.transfer / 1000} TB Transfer</li>
            <li>40 Gbps Inbound</li>
            <li>{this.bandwidthString(service.mbits_out)} Outbound</li>
        </ul>
      </div>
    );
  }
}
