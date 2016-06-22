import React, { Component } from 'react';

export const countryMap = {
  datacenter_2: 'us', // Dallas
  datacenter_3: 'us', // Fremont
  datacenter_4: 'us', // Atlanta
  datacenter_6: 'us', // Newark
  datacenter_7: 'gb', // London
  datacenter_8: 'jp', // Tokyo
  datacenter_9: 'sg', // Singapore
  datacenter_10: 'de', // Frankfurt
};

export default class DatacenterSelection extends Component {
  constructor() {
    super();
    this.render = this.render.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
  }

  renderHeader() {
    return (
      <header>
        <h2>Select a datacenter</h2>
      </header>
    );
  }

  render() {
    return (
      <div>
        {this.renderHeader()}
        <div className="card-body">TODO</div>
      </div>
    );
  }
}
