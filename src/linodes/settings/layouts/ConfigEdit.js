import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { getLinode, loadLinode } from '~/linodes/layouts/LinodeDetailPage';
import { fetchLinode, fetchLinodeConfig } from '~/actions/api/linodes';
import { fetchAllKernels } from '~/actions/api/kernels';
import HelpButton from '~/components/HelpButton';
import { Link } from '~/components/Link';
import Slider from 'rc-slider';

export class ConfigEdit extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.loadLinode = loadLinode.bind(this);
    this.renderEditUI = this.renderEditUI.bind(this);
    this.state = { loading: true };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    let linode = this.getLinode();
    const linodeId = parseInt(this.props.params.linodeId);
    const configId = parseInt(this.props.params.configId);
    if (!linode) {
      await dispatch(fetchLinode(linodeId));
      linode = this.getLinode();
    }
    let config = this.getConfig();
    if (!config) {
      await dispatch(fetchLinodeConfig(linodeId, configId));
      config = this.getConfig();
    }
    this.setState({
      ...config,
      loading: false,
      kernel: config.kernel.id,
    });
    const { kernels } = this.props;
    if (kernels.totalPages === -1) {
      await dispatch(fetchAllKernels());
    }
  }

  getConfig() {
    const linode = this.getLinode();
    if (!linode) {
      return null;
    }
    const configId = parseInt(this.props.params.configId);
    return linode._configs.configs[configId] || null;
  }

  renderEditUI() {
    const linode = this.getLinode();
    const totalRam = linode.services.reduce((t, s) => t + s.ram, 0);
    const { kernels } = this.props;
    const state = this.state;
    const input = (display, field, control) => (
      <div className="form-group row">
        <label
          htmlFor={`config-${field}`}
          className="col-sm-1 col-form-label"
        >{display}</label>
        <div className="col-sm-5">{control}</div>
      </div>);
    const text = (display, field) => input(display, field,
      <input
        className="form-control"
        id={`config-${field}`}
        placeholder={display}
        value={state[field]}
        onChange={e => this.setState({ [field]: e.target.value })}
      />);
    const radio = (display, field, value) => (
      <div className="form-check">
        <label className="form-check-label">
          <input
            className="form-check-input"
            type="radio"
            name={`config-${field}`}
            id={`config-${field}-${value}`}
            value={value}
            checked={state[field] === value}
            onChange={e => this.setState({ [field]: e.target.value })}
          /> {display}
        </label>
      </div>);

    return (
      <div style={{ marginTop: '2rem' }}>
        {text('Label', 'label')}
        {input('Notes', 'notes',
          <textarea
            className="form-control"
            id="config-comments"
            placeholder="Notes"
            value={state.comments}
            onChange={e => this.setState({ comments: e.target.value })}
          />)}
        <hr />
        <fieldset className="form-group row">
          <legend className="col-form-legend col-sm-2">
            Virtualization mode
          </legend>
          <div className="col-sm-3">
            <HelpButton className="pull-right" to="http://example.org" />
            {radio('Paravirtualization', 'virt_mode', 'paravirt')}
            {radio('Full virtualization', 'virt_mode', 'fullvirt')}
          </div>
        </fieldset>
        <hr />
        <h4>Boot settings</h4>
        <div className="form-group row">
          <label
            className="col-sm-2 col-form-label"
          >Kernel</label>
          <div className="col-sm-4">
            <select
              className="form-control"
              value={this.state.kernel}
              onChange={e => this.setState({ kernel: e.target.value })}
            >{Object.values(kernels.kernels).map(kernel =>
              <option key={kernel.id} value={kernel.id}>{kernel.id}</option>
            )}</select>
          </div>
        </div>
        <hr />
        <fieldset className="form-group row">
          <legend className="col-form-legend col-sm-2">
            Run level
          </legend>
          <div className="col-sm-3">
            {radio('Default', 'run_level', 'default')}
            {radio('Single-user mode', 'run_level', 'single')}
            {radio('init=/bin/bash', 'run_level', 'binbash')}
          </div>
        </fieldset>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label">Memory limit</label>
          <div className="col-sm-3 align-slider">
            <Slider
              min={0}
              max={totalRam}
              step={128}
              value={state.ram_limit}
              onChange={v => this.setState({ ram_limit: v })}
              tipFormatter={v => `${v} MiB`}
            />
          </div>
          <label className="col-sm-2 col-form-label">{state.ram_limit} MiB</label>
        </div>
        <hr />
        <p>TODO: block device assignment</p>
        <button
          className="btn btn-primary"
        >Save</button>
      </div>
    );
  }

  render() {
    const { loading } = this.state;
    return (
      <div>
        <h3>
          Edit profile
          <HelpButton to="https://example.org" />
          <Link
            className="btn btn-default pull-right"
            to={`/linodes/${this.props.params.linodeId}/settings/advanced`}
          >Cancel</Link>
        </h3>
        {/* TODO: Consistent loading UI */}
        {!loading ? this.renderEditUI() : <p>Loading</p>}
      </div>
    );
  }
}

ConfigEdit.propTypes = {
  linodes: PropTypes.object.isRequired,
  kernels: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    linodeId: PropTypes.string,
    configId: PropTypes.string,
  }),
};

function select(state) {
  return {
    linodes: state.api.linodes,
    kernels: state.api.kernels,
  };
}

export default connect(select)(ConfigEdit);
