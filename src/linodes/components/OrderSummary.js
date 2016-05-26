import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { distros as distroAssets, flags } from '~/assets';
import Service from './Service';
import { countryMap } from './DatacenterSelection';

export default class Summary extends Component {
  constructor() {
    super();
    this.render = this.render.bind(this);
    this.renderBack = this.renderBack.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
  }

  componentDidUpdate() {
    const { ui } = this.props;
    if (ui.showPassword) {
      const dom = ReactDOM.findDOMNode(this).querySelector('.pw');
      const range = document.createRange();
      range.selectNodeContents(dom);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  renderBack() {
    const { onBack } = this.props;
    return (<a
      href="#" className="back pull-right"
      onClick={e => { e.preventDefault(); onBack(); }}
    >Back</a>);
  }

  renderHeader() {
    return <h2>Order Summary</h2>;
  }

  renderSourceSummary(distro) {
    // TODO: other source types
    return (<div
      className="row summary-source"
    >
      <div className="col-md-1">
        <img
          src={distroAssets[distro.vendor]
            ? distroAssets[distro.vendor] : '//placehold.it/50x50'}
          width="24" height="24" alt={distro.vendor}
        />
      </div>
      <div className="col-md-11">{distro.label}</div>
    </div>);
  }

  renderDCSummary(dc) {
    return (<div className="row summary-dc">
      <div
        className="col-md-1"
      >
        <img
          src={flags[countryMap[dc.id]]
            ? flags[countryMap[dc.id]] : '//placehold.it/50x50'}
          width="24" height="24" alt={dc.label}
        />
      </div>
      <div className="col-md-11">{dc.label}</div>
    </div>);
  }

  render() {
    const {
      ui,
      services,
      distros,
      datacenters,
      onLabelChange,
      onShowRootPassword,
      onCreate,
    } = this.props;
    const done = ui.source && ui.datacenter && ui.service;
    if (!done) {
      return <div></div>;
    }
    const service = services.find(s => s.id === ui.service);
    const distro = distros[ui.source];
    const dc = datacenters[ui.datacenter];
    return (<div className="card creation-step">
      {this.renderBack()}
      {this.renderHeader()}
      <div className="summary">
        <div className="row">
          <div className="col-md-3">
            <Service service={service} />
          </div>
          <div className="col-md-9">
            <fieldset className="form-group">
              <label htmlFor="label">Label</label>
              <input
                className="form-control" id="label"
                value={ui.label} onChange={onLabelChange}
                placeholder="Name this Linode..."
              />
            </fieldset>
            <div className="summary">
              {this.renderSourceSummary(distro)}
              {this.renderDCSummary(dc)}
              <hr />
              <div className="row">
                <div className="col-md-11 col-md-offset-1">
                  Root password:
                  {ui.showPassword ? <strong className="pw">
                    {ui.password}
                  </strong> : ' '}
                  <a
                    href="#" onClick={e => {
                      e.preventDefault();
                      onShowRootPassword();
                    }}
                  >{ui.showPassword ? '(hide)' : '(show)'}</a>
                </div>
              </div>
              <div className="row">
                <div className="col-md-11 col-md-offset-1">
                  <label htmlFor="backups" className="checkbox">
                    <input type="checkbox" id="backups" />
                    Enable backups for this Linode? (+${
                      (service.monthly_price / 4 / 100).toFixed(2)
                    }/mo)
                  </label>
                </div>
              </div>
            </div>
            <button
              className="btn btn-primary order-button"
              onClick={onCreate}
            >
              <i className="fa fa-chevron-right"></i>&nbsp;
              Create Linode
            </button>
          </div>
        </div>
      </div>
    </div>);
  }
}

Summary.propTypes = {
  ui: PropTypes.object.isRequired,
  services: PropTypes.array.isRequired,
  distros: PropTypes.object.isRequired,
  datacenters: PropTypes.object.isRequired,
  onBack: PropTypes.func,
  onLabelChange: PropTypes.func,
  onShowRootPassword: PropTypes.func,
  onCreate: PropTypes.func,
};
