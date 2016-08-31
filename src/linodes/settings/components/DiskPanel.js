import React, { Component, PropTypes } from 'react';
import {
  fetchLinode,
  fetchAllLinodeDisks,
  putLinodeDisk,
  resizeLinodeDisk,
} from '~/actions/api/linodes';
import HelpButton from '~/components/HelpButton';
import { getLinode, loadLinode } from '~/linodes/layouts/LinodeDetailPage';
import { showModal, hideModal } from '~/actions/modal';
import Slider from 'rc-slider';

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
    };
  }

  componentDidMount() {
    const { disk } = this.props;
    this.setState({ label: disk.label, size: disk.size });
  }

  async saveChanges() {
    const { size, label } = this.state;
    const { linode, disk, dispatch } = this.props;
    this.setState({ loading: true });
    if (label !== disk.label) {
      await dispatch(putLinodeDisk({ label }, linode.id, disk.id));
    }
    if (size !== disk.size) {
      await dispatch(resizeLinodeDisk(linode.id, disk.id, size));
    }
    this.setState({ loading: false });
    dispatch(hideModal());
  }

  render() {
    const { disk } = this.props;
    const { label, size, loading } = this.state;
    const { free, dispatch } = this.props;
    return (
      <div>
        <div className="form-group">
          <label htmlFor="label">Label</label>
          <input
            className="form-control"
            id="label"
            placeholder="Label"
            value={label}
            disabled={loading}
            onChange={e => this.setState({ label: e.target.value })}
          />
        </div>
        <div className="form-group">
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
        </div>
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
                  className="disk"
                  key={d.id}
                  style={{
                    flexGrow: d.size,
                    borderColor: borderColors[disks.indexOf(d) % borderColors.length],
                  }}
                >
                  <h4>{d.label} <small>{d.filesystem}</small></h4>
                  <p>{d.size} MiB</p>
                  {poweredOff ?
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
