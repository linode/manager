import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {
  fetchLinode,
  fetchAllLinodeDisks,
  putLinodeDisk,
  createLinodeDisk,
  deleteLinodeDisk,
  resizeLinodeDisk,
} from '~/actions/api/linodes';
import { fetchAllDistros } from '~/actions/api/distros';
import HelpButton from '~/components/HelpButton';
import PasswordInput from '~/components/PasswordInput';
import { getLinode, loadLinode } from '~/linodes/layouts/LinodeDetailPage';
import { showModal, hideModal } from '~/actions/modal';
import Slider from 'rc-slider';
import _ from 'lodash';
import { ErrorSummary, FormGroup, reduceErrors } from '~/errors';

const borderColors = [
  '#1abc9c',
  '#3498db',
  '#9b59b6',
  '#16a085',
  '#f1c40f',
  '#27ae60',
  '#2980b9',
  '#2ecc71',
  '#e67e22',
];

export class EditModal extends Component {
  constructor() {
    super();
    this.componentDidMount = this.componentDidMount.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
    this.state = {
      loading: false,
      size: -1,
      label: '',
      errors: {},
    };
  }

  componentDidMount() {
    const { disk } = this.props;
    this.setState({ label: disk.label, size: disk.size });
  }

  async saveChanges() {
    const { size, label } = this.state;
    const { linode, disk, dispatch } = this.props;
    this.setState({ loading: true, errors: {} });
    try {
      if (size !== disk.size) {
        await dispatch(resizeLinodeDisk(linode.id, disk.id, size));
      }
      if (label !== disk.label) {
        await dispatch(putLinodeDisk({ label }, linode.id, disk.id));
      }
      this.setState({ loading: false });
      dispatch(hideModal());
    } catch (response) {
      this.setState({ loading: false, errors: await reduceErrors(response) });
    }
  }

  render() {
    const { disk } = this.props;
    const { label, size, errors, loading } = this.state;
    const { free, dispatch } = this.props;
    return (
      <div>
        <FormGroup errors={errors} field="label">
          <label htmlFor="label">Label</label>
          <input
            className="form-control"
            id="label"
            placeholder="Label"
            value={label}
            disabled={loading}
            onChange={e => this.setState({ label: e.target.value })}
          />
        </FormGroup>
        <FormGroup errors={errors} field="size">
          <label>Size ({size} MiB)</label>
          <Slider
            min={256}
            max={free + disk.size}
            step={256}
            value={size}
            disabled={loading}
            onChange={v => this.setState({ size: v })}
            tipFormatter={v => `${v} MiB`}
            marks={{
              [disk.size]: `Current (${disk.size} MiB)`,
            }}
          />
        </FormGroup>
        <ErrorSummary errors={errors} />
        <div className="modal-footer">
          <button
            className="btn btn-default"
            disabled={loading}
            onClick={() => dispatch(hideModal())}
          >Nevermind</button>
          <button
            className="btn btn-primary"
            onClick={() => this.saveChanges()}
            disabled={loading}
          >Save</button>
        </div>
      </div>);
  }
}

EditModal.propTypes = {
  linode: PropTypes.object.isRequired,
  disk: PropTypes.object.isRequired,
  free: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export class DeleteModal extends Component {
  constructor() {
    super();
    this.state = { loading: false };
  }

  render() {
    const { dispatch, linode, disk } = this.props;
    const { loading } = this.state;
    return (
      <div>
        <p>Are you sure you want to delete this disk? This cannot be undone.</p>
        <div className="modal-footer">
          <button
            className="btn btn-default"
            disabled={loading}
            onClick={() => dispatch(hideModal())}
          >Nevermind</button>
          <button
            className="btn btn-danger"
            disabled={loading}
            onClick={async () => {
              this.setState({ loading: true });
              await dispatch(deleteLinodeDisk(linode.id, disk.id));
              this.setState({ loading: false });
              dispatch(hideModal());
            }}
          >Delete disk</button>
        </div>
      </div>);
  }
}

DeleteModal.propTypes = {
  linode: PropTypes.object.isRequired,
  disk: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export class AddModal extends Component {
  constructor() {
    super();
    this.createDisk = this.createDisk.bind(this);
    this.state = {
      loading: true,
      errors: { label: [], size: [], _: [] },
      label: '',
      size: 1024,
      distro: '',
      password: '',
      filesystem: 'ext4',
    };
  }

  async componentDidMount() {
    const { dispatch, distributions, free } = this.props;
    this.setState({ size: free });
    if (distributions.totalPages === -1) {
      await dispatch(fetchAllDistros());
    }
    this.setState({ loading: false });
  }

  async createDisk() {
    const { dispatch, linode } = this.props;
    const { label, size, distro, password, filesystem } = this.state;
    this.setState({ loading: true });
    try {
      await dispatch(createLinodeDisk({
        label,
        size,
        filesystem,
        distribution: distro === '' ? null : distro,
        root_pass: password,
      }, linode.id));
      this.setState({ loading: false });
      dispatch(hideModal());
    } catch (response) {
      const json = await response.json();
      const reducer = f => (s, e) => {
        if (e.field === f) {
          return s ? [...s, e.reason] : [e.reason];
        }
        return s;
      };
      this.setState({
        loading: false,
        errors: {
          label: json.errors.reduce(reducer('label'), []),
          size: json.errors.reduce(reducer('size'), []),
          _: json.errors.reduce((s, e) =>
            ['label', 'size'].indexOf(e.field) === -1 ?
            [...s, e.reason] : [...s], []),
        },
      });
    }
  }

  render() {
    const { dispatch, free } = this.props;
    const { distributions } = this.props;
    const vendors = _.sortBy(
      _.map(
        _.groupBy(Object.values(distributions.distributions), d => d.vendor),
        (v, k) => ({
          name: k,
          versions: _.orderBy(v, ['recommended', 'created'], ['desc', 'desc']),
        })
      ), vendor => vendor.name);
    const options = [<option key={''} value={''}>None</option>];
    for (let i = 0; i < vendors.length; ++i) {
      const v = vendors[i];
      if (i !== 0) {
        options.push(<option key={v.name} disabled>──────────</option>);
      }
      v.versions.forEach(d =>
        options.push(<option key={d.id} value={d.id}>{d.label}</option>));
    }
    const {
      loading,
      label,
      size,
      distro,
      filesystem,
      password,
      errors,
    } = this.state;
    const ready = !(!loading && label &&
      (distro ? password : filesystem));

    return (
      <div>
        <div className={`form-group ${errors.label.length ? 'has-danger' : ''}`}>
          <label htmlFor="label">Label</label>
          <input
            className="form-control"
            id="label"
            placeholder="Label"
            value={label}
            disabled={loading}
            onChange={e => this.setState({ label: e.target.value })}
          />
          {errors.label.length ?
            <div className="form-control-feedback">
              {errors.label.map(error => <div key={error}>{error}</div>)}
            </div> : null}
        </div>
        <div className="form-group">
          <label>Distribution (optional)</label>
          <select
            className="form-control"
            disabled={loading}
            onChange={e => this.setState({ distro: e.target.value })}
            value={distro}
          >{options}</select>
        </div>
        {distro ?
          <div className="form-group">
            <label>Root password</label>
            <PasswordInput
              onChange={p => this.setState({ password: p })}
              passwordType="offline_fast_hashing_1e10_per_second"
            />
          </div>
            :
          <div className="form-group">
            <label>Filesystem</label>
            <select
              className="form-control"
              onChange={e => this.setState({ filesystem: e.target.value })}
              disabled={loading}
              value={filesystem}
            >
              <option value="ext3">ext3</option>
              <option value="ext4">ext4</option>
              <option value="swap">swap</option>
              <option value="raw">raw</option>
            </select>
          </div>
        }
        <div className={`form-group ${errors.size.length ? 'has-danger' : ''}`}>
          <label>Size ({size} MiB)</label>
          <Slider
            min={distro
              ? distributions.distributions[distro].minimum_storage_size
              : 256}
            max={free}
            step={256}
            value={size}
            disabled={loading}
            onChange={v => this.setState({ size: v })}
            tipFormatter={v => `${v} MiB`}
          />
          {errors.size.length ?
            <div className="form-control-feedback">
              {errors.size.map(error => <div key={error}>{error}</div>)}
            </div> : null}
        </div>
        {errors._.length ?
          <div className="alert alert-danger">
            {errors._.map(error => <div key={error}>{error}</div>)}
          </div> : null}
        <div className="modal-footer">
          <button
            className="btn btn-default"
            disabled={loading}
            onClick={() => dispatch(hideModal())}
          >Nevermind</button>
          <button
            className="btn btn-primary"
            disabled={ready}
            onClick={() => this.createDisk()}
          >Add disk</button>
        </div>
      </div>);
  }
}

AddModal.propTypes = {
  distributions: PropTypes.object.isRequired,
  linode: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  free: PropTypes.number.isRequired,
};

function select(state) {
  return { distributions: state.api.distributions };
}

const AddModalRedux = connect(select)(AddModal);

export class DiskPanel extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.loadLinode = loadLinode.bind(this);
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    let linode = this.getLinode();
    if (!linode) {
      const linodeId = parseInt(this.props.params.linodeId);
      await dispatch(fetchLinode(linodeId));
      linode = this.getLinode();
    }
    if (linode._disks.totalPages === -1) {
      await dispatch(fetchAllLinodeDisks(linode.id));
    }
  }

  render() {
    const { dispatch } = this.props;
    const linode = this.getLinode();
    const disks = Object.values(linode._disks.disks);
    const total = linode.services.reduce((total, service) =>
      total + service.storage, 0) * 1024;
    const used = disks.reduce((total, disk) => total + disk.size, 0);
    const free = total - used;
    const poweredOff = linode.state === 'offline';

    return (
      <div className="linode-configs sm-col-12">
        <div className="row">
          <div className="col-sm-6 left">
            <h3>Disks<HelpButton to="http://example.org" /></h3>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <div className="disk-layout">
              {disks.map(d =>
                <div
                  className={`disk disk-${d.state}`}
                  key={d.id}
                  style={{
                    flexGrow: d.size,
                    borderColor: borderColors[disks.indexOf(d) % borderColors.length],
                  }}
                >
                  <h4>{d.label} <small>{d.filesystem}</small></h4>
                  <p>{d.size} MiB</p>
                  {d.state === 'deleting' ?
                    <div className="text-muted">Being deleted</div>
                  : null}
                  {poweredOff && d.state !== 'deleting' ?
                    <div>
                      <button
                        className="btn btn-edit btn-default"
                        style={{ marginRight: '0.5rem' }}
                        onClick={() => dispatch(showModal(`Edit ${d.label}`,
                          <EditModal
                            free={free}
                            linode={linode}
                            disk={d}
                            dispatch={dispatch}
                          />))}
                      >Edit</button>
                      <button
                        className="btn btn-delete btn-default"
                        onClick={() => dispatch(showModal(`Delete ${d.label}`,
                          <DeleteModal
                            linode={linode}
                            disk={d}
                            dispatch={dispatch}
                          />))}
                      >Delete</button>
                    </div>
                  : null}
                </div>)}
              {free > 0 ?
                <div
                  className="disk free"
                  key={'free'}
                  style={{ flexGrow: free }}
                >
                  <h4>Unallocated</h4>
                  <p>{free} MiB</p>
                  {poweredOff ?
                    <button
                      onClick={() => dispatch(showModal('Add a disk',
                        <AddModalRedux free={free} linode={linode} />))}
                      className="btn btn-add btn-default"
                    >Add a disk</button>
                  : null}
                </div> : null}
            </div>
          </div>
        </div>
        {!poweredOff ?
          <div className="alert alert-info" style={{ marginTop: '1rem' }}>
            Your Linode must be powered off to manage your disks.
          </div> : null}
      </div>
    );
  }
}

DiskPanel.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    linodeId: PropTypes.string,
  }),
};
