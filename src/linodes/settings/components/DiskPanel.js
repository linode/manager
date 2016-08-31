import React, { Component, PropTypes } from 'react';
import {
  fetchLinode,
  fetchAllLinodeDisks,
} from '~/actions/api/linodes';
import HelpButton from '~/components/HelpButton';
import { getLinode, loadLinode } from '~/linodes/layouts/LinodeDetailPage';

const borderColors = [
  '#1abc9c',
  '#2ecc71',
  '#3498db',
  '#9b59b6',
  '#16a085',
  '#27ae60',
  '#2980b9',
  '#f1c40f',
  '#e67e22',
  '#e74c3c',
];

function hash(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

function getBorderColor(seed) {
  return borderColors[Math.abs(hash(seed)) % borderColors.length];
}

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
    const linode = this.getLinode();
    const disks = Object.values(linode._disks.disks);
    const total = linode.services.reduce((total, service) =>
      total + service.storage, 0) * 1024;
    const used = disks.reduce((total, disk) => total + disk.size, 0);
    const free = total - used;

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
                    borderColor: getBorderColor(d.label),
                  }}
                >
                  <h4>{d.label} <small>{d.filesystem}</small></h4>
                  <p>{d.size} MiB</p>
                  <button
                    className="btn btn-default"
                  >Edit disk</button>
                </div>)}
              {free > 0 ?
                <div
                  className="disk free"
                  key={'free'}
                  style={{ flexGrow: free }}
                >
                  <h4>Unallocated</h4>
                  <p>{free} MiB</p>
                  <button
                    className="btn btn-default"
                  >Add a disk</button>
                </div> : null}
            </div>
          </div>
        </div>
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
