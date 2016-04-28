import React, { Component } from 'react';
import _ from 'underscore';
import { flags } from '~/assets';

// TODO: This is lame, we should extend the API to include country code
export const countryMap = {
  'datacenter_2': 'us', // Dallas
  'datacenter_3': 'us', // Fremont
  'datacenter_4': 'us', // Atlanta
  'datacenter_6': 'us', // Newark
  'datacenter_7': 'gb', // London
  'datacenter_8': 'jp', // Tokyo
  'datacenter_9': 'sg', // Singapore
  'datacenter_10': 'de', // Frankfurt
};

export default class DatacenterSelection extends Component {
  constructor() {
    super();
    this.render = this.render.bind(this);
    this.renderDC = this.renderDC.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderBack = this.renderBack.bind(this);
  }

  renderDC(dc) {
    const { onSelection, selected } = this.props;
    return (
      <div className={`dc ${selected == dc.id ? 'selected' : ''}`}
          key={dc.id} onClick={() => onSelection(dc.id)}>
        <img src={flags[countryMap[dc.id]]
          ? flags[countryMap[dc.id]] : '//placehold.it/50x50'}
          width="96" height="96" alt={dc.label} />
        {dc.label}
      </div>
    );
  }

  renderBack() {
    const { onBack, ui } = this.props;
    if (ui.datacenter === null) {
      return <a href="#" className="back pull-right"
        onClick={e => { e.preventDefault(); onBack() }}>Back</a>;
    }
  }

  renderHeader() {
    const { ui, datacenters } = this.props;
    if (ui.datacenter === null) {
      return <h2>Select a Datacenter</h2>;
    } else {
      const dc = datacenters.find(d => d.id == ui.datacenter);
      return <h2 className="text-right">
        {dc.label}
        <img className="dc-icon" src={flags[countryMap[dc.id]]
          ? flags[countryMap[dc.id]] : '//placehold.it/24x24'}
          width="24" height="24" alt={dc.label} />
      </h2>;
    }
  }

  render() {
    let { datacenters, ui } = this.props;
    if (ui.source === null) {
      return <div></div>;
    }
    datacenters = [
      { id: "datacenter_2", label: "Dallas, TX" },
      { id: "datacenter_3", label: "Fremont, CA" },
      { id: "datacenter_4", label: "Atlanta, GA" },
      { id: "datacenter_6", label: "Newark, NJ" },
      { id: "datacenter_7", label: "London, UK" },
      { id: "datacenter_8", label: "Tokyo, JP" },
      { id: "datacenter_9", label: "Singapore, SG" },
      { id: "datacenter_10", label: "Frankfurt, DE" }
    ];
    return (
      <div className={`card creation-step ${
          ui.datacenter !== null ? 'step-done' : ''}`}>
        {this.renderBack()}
        {this.renderHeader()}
        {ui.datacenter !== null ? "" :
          <div className="dc-list">
            {datacenters.map(this.renderDC)}
          </div>}
      </div>
    );
  }
}
