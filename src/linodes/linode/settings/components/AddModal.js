import React, { Component, PropTypes } from 'react';
import _ from 'lodash';

import { linodes } from '~/api';
import { CancelButton, Form, FormGroup, FormGroupError, Input, Select,
  SubmitButton, PasswordInput } from '~/components/form';
import { ErrorSummary, reduceErrors } from '~/errors';
import { hideModal } from '~/actions/modal';

export class AddModal extends Component {
  constructor() {
    super();
    this.createDisk = this.createDisk.bind(this);
    this.state = {
      loading: false,
      errors: {},
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

    this.setState({ loading: true, errors: {} });

    try {
      await dispatch(linodes.disks.post({
        label,
        size,
        filesystem,
        distribution: distro === '' ? null : distro,
        root_pass: password,
      }, linode.id));
      dispatch(hideModal());
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }

    this.setState({ loading: false });
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

    // TODO: Replace hardcoded filesystems
    const filesystems = [];
    filesystems.push({ value: 'ext3', label: 'ext3' });
    filesystems.push({ value: 'ext4', label: 'ext4' });
    filesystems.push({ value: 'swap', label: 'swap' });
    filesystems.push({ value: 'raw', label: 'raw' });
    const distros = [{ value: '', label: 'None' }];
    for (let i = 0; i < vendors.length; ++i) {
      const v = vendors[i];
      if (i !== 0) {
        distros.push({ value: v.name, disabled: 'disabled', label: '──────────' });
      }
      v.versions.forEach(d =>
        distros.push({ value: d.id, label: d.label }));
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
        <FormGroup
          errors={errors}
          name="label"
          className="row"
        >
          <div className="col-sm-5 label-col">
            <label>Label</label>
          </div>
          <div className="col-sm-7">
            <div>
              <Input
                id="label"
                placeholder="Label"
                value={label}
                onChange={e => this.setState({ label: e.target.value })}
              />
            </div>
            <FormGroupError errors={errors} name="label" />
          </div>
        </FormGroup>

        <FormGroup
          errors={errors}
          name="distribution"
          className="row"
        >
          <div className="col-sm-5 label-col">
            <label>Distribution (optional)</label>
          </div>
          <div className="col-sm-7">
            <div>
              <Select
                id="distribution"
                value={distro}
                options={distros}
                onChange={e => this.setState({ distro: e.target.value })}
              />
            </div>
            <FormGroupError errors={errors} name="distribution" />
          </div>
        </FormGroup>
            {distro ?
              <FormGroup
                errors={errors}
                name="password"
                className="row"
              >
                <div className="col-sm-5 label-col">
                  <label>Root password</label>
                </div>
                <div className="col-sm-7">
                  <PasswordInput
                    onChange={p => this.setState({ password: p })}
                  />
                </div>
                <FormGroupError errors={errors} name="password" />
              </FormGroup>
                :
              <FormGroup
                errors={errors}
                name="filesystem"
                className="row"
              >
                <div className="col-sm-5 label-col">
                  <label>Filesystem</label>
                </div>
                <div className="col-sm-7">
                  <div>
                    <Select
                      id="filesystem"
                      value={filesystem}
                      options={filesystems}
                      onChange={e => this.setState({ filesystem: e.target.value })}
                    />
                  </div>
                  <FormGroupError errors={errors} name="filesystem" />
                </div>
              </FormGroup>
            }
        <FormGroup
          errors={errors}
          name="size"
          className="row"
        >
          <div className="col-sm-5 label-col">
            <label>Size (MB)</label>
          </div>
          <div className="col-sm-7">
            <Input
              className="LinodesLinodeSettingsComponentsAddModal-disk-size"
              type="number"
              min={distro ? minimumStorageSize() : 8}
              max={free}
              value={size}
              onChange={e => this.setState({ size: parseInt(e.target.value, 10) })}
            />
            <FormGroupError errors={errors} name="size" />
          </div>
        </FormGroup>
        <div className="modal-footer">
          <CancelButton
            className="LinodesLinodeSettingsComponentsAddModal-cancel"
            disabled={loading}
            onClick={() => dispatch(hideModal())}
          />
          <SubmitButton
            disabled={ready}
          >Add Disk</SubmitButton>
        </div>

        <ErrorSummary errors={errors} />
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
