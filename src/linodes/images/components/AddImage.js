import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { ModalFormGroup, Input, Textarea, Select } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { showModal, hideModal } from '~/actions/modal';
import api from '~/api';
import { imagizeLinodeDisk } from '~/api/ad-hoc/linodes';
import { dispatchOrStoreErrors } from '~/api/util';
import LinodeSelect from '~/linodes/components/LinodeSelect';


export default class AddImage extends Component {
  static title = 'Imagize Disk'

  static trigger(dispatch, linodes, linode, disk) {
    return dispatch(showModal(AddImage.title, (
      <AddImage
        dispatch={dispatch}
        linodes={linodes}
        linode={linode}
        disk={disk}
      />
    )));
  }

  constructor(props) {
    super(props);
    const { linode, linodes, disk } = props;

    this.state = {
      linode,
      linodes,
      disk,
      allDisks: {},
      disks: false,
      errors: {},
      loading: false,
    };

    this.onChange = onChange.bind(this);
  }

  onLinodeChange = async (e) => {
    const { allDisks } = this.state;
    const linodeId = e.target.value;

    this.onChange(e);

    if (linodeId === LinodeSelect.EMPTY) {
      return;
    }

    this.setState({
      loading: true,
      disk: null,
    });

    if (!allDisks[linodeId]) {
      const disks = await this.props.dispatch(api.linodes.disks.all([linodeId]));
      const linodeDisks = Object.values(disks.data).map(function (disk) {
        return {
          label: disk.label,
          value: disk.id,
          size: disk.size,
          filesystem: disk.filesystem,
        };
      });

      this.setState({
        allDisks: { ...allDisks, [linodeId]: linodeDisks },
        loading: false,
      });
    }
  }

  onSubmit = () => {
    const { description, label, linode, disk } = this.state;
    const { dispatch } = this.props;

    const requests = [hideModal];
    requests.unshift(() => imagizeLinodeDisk(linode.id || linode, disk.id || disk, {
      label,
      description,
    }));

    return dispatch(dispatchOrStoreErrors.call(this, requests));
  }

  getDiskObject = (disks, disk) => {
    return Object.values(disks).map(function (diskObj) {
      if (diskObj.value === disk) {
        return diskObj;
      }
    })[0];
  }

  render() {
    const { dispatch } = this.props;
    const { label, description, errors, linode, linodes, disk, allDisks, loading } = this.state;
    const disks = allDisks[linode] || [];
    const diskObj = linodes ? this.getDiskObject(disks, disk) : disk;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={() => dispatch(hideModal())}
        buttonText="Create Image"
        analytics={{ title: AddImage.title }}
        errors={errors}
      >
        <div>
          {linodes ?
            <ModalFormGroup label="Linode" id="linode">
              <LinodeSelect
                linodes={linodes.linodes}
                value={linode}
                name="linode"
                id="linode"
                onChange={this.onLinodeChange}
              />
            </ModalFormGroup>
          : null}
          {linodes ?
            <ModalFormGroup label="Disk" id="disk">
              {disks.length ?
                <Select
                  options={disks}
                  value={disk}
                  name="disk"
                  id="disk"
                  onChange={this.onChange}
                />
              :
                <Input
                  value={loading ? '' : 'None'}
                  disabled
                />
              }
            </ModalFormGroup>
          : null}
          {disk ?
            <ModalFormGroup label="Type" id="type">
              <Input
                value={diskObj.filesystem}
                disabled
              />
            </ModalFormGroup>
          : null}
          {disk ?
            <ModalFormGroup errors={errors} label="Size" id="size">
              <Input
                value={`${diskObj.size} MB`}
                disabled
              />
              <small className="text-muted">
                Disk usage may not exceed 2048 MB for this Image.
              </small>
            </ModalFormGroup>
          : null}
          <ModalFormGroup errors={errors} id="label" label="Label" apiKey="label">
            <Input
              id="label"
              name="label"
              placeholder="Label"
              value={label}
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup errors={errors} id="description" label="Description" apiKey="description">
            <div>
              <Textarea
                value={description}
                onChange={this.onChange}
                id="description"
                name="description"
              />
            </div>
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

AddImage.propTypes = {
  linodes: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  linode: PropTypes.object,
  disk: PropTypes.object,
};
