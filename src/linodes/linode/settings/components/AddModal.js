import React, { Component, PropTypes } from 'react';
import _ from 'lodash';

import { linodes } from '~/api';
import { CancelButton, Form, SubmitButton } from '~/components/form';
import PasswordInput from '~/components/PasswordInput';
import { hideModal } from '~/actions/modal';

export class AddModal extends Component {
  constructor() {
    super();
    this.createDisk = this.createDisk.bind(this);
    this.state = {
      loading: false,
      errors: { label: [], size: [], _: [] },
      label: '',
      size: 1024,
      distro: '',
      password: '',
      filesystem: 'ext4',
    };
  }

  componentDidMount() {
    const { free } = this.props;
    this.setState({ size: free });
  }

  async createDisk() {
    const { dispatch, linode } = this.props;
    const { label, size, distro, password, filesystem } = this.state;
    this.setState({ loading: true });
    try {
      await dispatch(linodes.disks.post({
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
    const { dispatch, free, distributions } = this.props;
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

    const minimumStorageSize = () =>
      distributions.distributions[distro].minimum_storage_size;

    return (
      <Form
        onSubmit={() => this.createDisk()}
      >
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
          <label>Size (MB)</label>
          <input
            type="number"
            min={distro ? minimumStorageSize() : 8}
            max={free}
            className="form-control"
            value={size}
            onChange={e => this.setState({ size: parseInt(e.target.value, 10) })}
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
          <CancelButton
            disabled={loading}
            onClick={() => dispatch(hideModal())}
          />
          <SubmitButton
            disabled={ready}
          >Add Disk</SubmitButton>
        </div>
      </Form>
    );
  }
}

AddModal.propTypes = {
  distributions: PropTypes.object.isRequired,
  linode: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  free: PropTypes.number.isRequired,
};
