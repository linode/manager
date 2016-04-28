import React, { Component } from 'react';
import { distros, flags } from '../../assets';
import Service from './Service';
import { countryMap } from './DatacenterSelection';

export default class Summary extends Component {
  constructor() {
    super();
    this.render = this.render.bind(this);
    this.renderBack = this.renderBack.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
  }

  renderBack() {
    const { onBack } = this.props;
    return <a href="#" className="back pull-right"
      onClick={e => { e.preventDefault(); onBack() }}>Back</a>;
  }

  renderHeader() {
    return <h2>Order Summary</h2>;
  }

  renderSourceSummary(distro) {
    // TODO: other source types
    return <div className="row summary-source">
        <div className="col-md-1">
          <img src={distros[distro.vendor]
            ? distros[distro.vendor] : '//placehold.it/50x50'}
            width="24" height="24" alt={distro.vendor} />
        </div>
        <div className="col-md-11">{distro.label}</div>
      </div>;
  }

  renderDCSummary(dc) {
    return <div className="row summary-dc">
      <div className="col-md-1">
        <img src={flags[countryMap[dc.id]]
          ? flags[countryMap[dc.id]] : '//placehold.it/50x50'}
          width="24" height="24" alt={dc.label} />
      </div>
      <div className="col-md-11">{dc.label}</div>
    </div>;
  }

  render() {
    const { ui, services, distros, datacenters } = this.props;
    const done = ui.source && ui.datacenter && ui.service;
    if (!done) {
        return <div></div>;
    }
    const service = services.find(s => s.id === ui.service);
    const distro = distros.find(d => d.id === ui.source);
    const dc = datacenters.find(d => d.id === ui.datacenter);
    return <div className="card creation-step">
      {this.renderBack()}
      {this.renderHeader()}
      <div className="summary">
        <div className="row">
          <div className="col-md-3">
            <Service service={service} />
          </div>
          <div className="col-md-9">
            <fieldset className="form-group">
              <label for="label">Label</label>
              <input className="form-control" id="label"
                placeholder="Name this Linode..." />
            </fieldset>
            <div className="summary">
              {this.renderSourceSummary(distro)}
              {this.renderDCSummary(dc)}
              <div className="row">
                <div className="col-md-1">
                  <i className="fa fa-key"></i>
                </div>
                <div className="col-md-11">
                  Root password: <a href="#">show</a>
                </div>
              </div>
              <div className="row">
                <div className="col-md-1">
                  <input type="checkbox" id="backups" />
                </div>
                <div className="col-md-11">
                  <label for="backups" className="checkbox">
                    Enable backups (+${
                      (service.monthly_price / 4 / 100).toFixed(2)
                    }/mo)
                  </label>
                </div>
              </div>
            </div>
            <button className="btn btn-primary order-button">
              <i className="fa fa-chevron-right"></i>&nbsp;
              Create Linode
            </button>
          </div>
        </div>
      </div>
    </div>;
  }
};
