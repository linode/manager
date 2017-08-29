import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';

import { Input, ModalFormGroup } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import { volumes } from '~/api';
import { actions as linodeActions } from '~/api/configs/linodes';
import { dispatchOrStoreErrors } from '~/api/util';
import { RegionSelect } from '~/components';
import LinodeSelect from '~/linodes/components/LinodeSelect';


export default class AddEditVolume extends Component {
  static trigger(dispatch, linodes, volume, linode) {
    const title = volume ? 'Edit Volume' : 'Add a Volume';
    return dispatch(showModal(title, (
      <AddEditVolume
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
        linodes={linodes}
        volume={volume}
        title={title}
        linode={linode}
      />
    )));
  }

  constructor(props) {
    super(props);

    const { volume = {}, linode } = props;

    this.state = {
      linode,
      errors: {},
      label: volume.label || '',
      size: volume.size || 10,
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, close, volume: { id } = {} } = this.props;
    const { label, region, size, linode } = this.state;

    const data = id ? { label } : {
      label,
      region,
      size,
      linode_id: linode === LinodeSelect.EMPTY ? undefined : linode,
    };

    const actions = [
      () => volumes[id ? 'put' : 'post'](data, ...[id].filter(Boolean)),
      close,
    ];

    if (!id && linode !== LinodeSelect.EMPTY) {
      actions.splice(1, 0, (volume) =>
        linodeActions.volumes.one(volume, linode, volume.id));
    }

    return dispatch(dispatchOrStoreErrors.call(this, actions));
  }

  render() {
    const { close, title, volume, linode: original, linodes } = this.props;
    const { errors, region, label, size, linode } = this.state;

    const showLinodeAndRegion = !volume && !original;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText={volume ? undefined : 'Add Volume'}
        buttonDisabledText={volume ? undefined : 'Adding Volume'}
        analytics={{ title, action: 'add' }}
        errors={errors}
      >
        <div>
          {volume || !original ? null : (
            <p>
              Your new volume will be attached to this Linode. If you'd like
              to create an unattached volume or attach it to another Linode or
              create it in another region, click <Link to="/volumes">here</Link>.
            </p>
          )}
          <ModalFormGroup label="Label" id="label" apiKey="label" errors={errors}>
            <Input
              placeholder="my-volume"
              value={label}
              name="label"
              id="label"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          {!showLinodeAndRegion ? null : (
            <ModalFormGroup label="Region" id="region" apiKey="region" errors={errors}>
              <RegionSelect
                value={region}
                name="region"
                id="region"
                onChange={this.onChange}
              />
            </ModalFormGroup>
          )}
          <ModalFormGroup label="Size" id="size" apiKey="size" errors={errors}>
            <Input
              placeholder="20"
              value={size}
              name="size"
              id="size"
              onChange={this.onChange}
              type="number"
              min={0}
              label="GiB"
              disabled={/* TODO: undisable this once API support for resizing works */!!volume}
            />
          </ModalFormGroup>
          {!showLinodeAndRegion ? null : (
            <div>
              <h3>Attach To</h3>
              <ModalFormGroup label="Linode" id="linode" apiKey="linode_id" errors={errors}>
                <LinodeSelect
                  linodes={linodes}
                  value={linode}
                  name="linode"
                  id="linode"
                  onChange={this.onChange}
                  allowNone
                />
              </ModalFormGroup>
            </div>
          )}
        </div>
      </FormModalBody>
    );
  }
}

AddEditVolume.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  volume: PropTypes.object,
  linode: PropTypes.object,
};
