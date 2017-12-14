import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Input, ModalFormGroup } from 'linode-components';
import { onChange } from 'linode-components';
import { FormModalBody } from 'linode-components';

import { hideModal, showModal } from '~/actions/modal';
import api from '~/api';
import { updateClientThumbnail } from '~/api/ad-hoc/clients';
import { dispatchOrStoreErrors } from '~/api/util';
import { MAX_UPLOAD_SIZE_MB } from '~/constants';

import { renderSecret } from './CreatePersonalAccessToken';


export default class CreateOrEditApplication extends Component {
  static trigger(dispatch, client = {}) {
    const title = client ? 'Create an OAuth Client' : 'Edit OAuth Client';

    return dispatch(showModal(title, (
      <CreateOrEditApplication
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
        title={title}
        {...client}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = {
      label: props.label || '',
      redirect: props.redirect_uri || '',
      thumbnail: props.thumbnail || '',
      public_: props.public || false,
      errors: {},
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, id, close } = this.props;
    const { label, redirect, thumbnail, public_ } = this.state;

    const data = { label, redirect_uri: redirect, public: public_ };
    const idsPath = [id].filter(Boolean);

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.clients[id ? 'put' : 'post'](data, ...idsPath),
      ({ id }) => {
        if (thumbnail) {
          if ((thumbnail.size / (1024 * 1024)) < MAX_UPLOAD_SIZE_MB) {
            return updateClientThumbnail(id, thumbnail);
          }

          // eslint-disable-next-line no-throw-literal
          throw { json: () => Promise.resolve({
            errors: [{
              field: 'thumbnail',
              reason: `File size must be under ${MAX_UPLOAD_SIZE_MB} MB`,
            }],
          }) };
        }
      },
      ({ secret }) => id ? close() :
        renderSecret('client', 'created', secret, close),
    ]));
  }

  render() {
    const { close, title, id, forEdit } = this.props;
    const { errors, label, redirect, public_ } = this.state;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        errors={errors}
        analytics={{ title, action: id ? 'edit' : 'add' }}
      >
        <div>
          <ModalFormGroup id="label" label="Label" apiKey="label" errors={errors}>
            <Input
              name="label"
              id="label"
              placeholder="My client"
              value={label}
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup id="redirect" label="Redirect URI" apiKey="redirect_uri" errors={errors}>
            <Input
              name="redirect"
              id="redirect"
              placeholder="http://localhost:3000/oauth/callback"
              value={redirect}
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup id="thumbnail" label="Thumbnail" apiKey="thumbnail" errors={errors}>
            <Input
              name="thumbnail"
              id="thumbnail"
              type="file"
              onChange={(e) => this.setState({ thumbnail: e.target.files[0] })}
            />
          </ModalFormGroup>
          <ModalFormGroup id="public" label="Public" apiKey="public" errors={errors}>
            <Input
              name="public_"
              id="public_"
              type="checkbox"
              checked={public_}
              disabled={forEdit}
              onChange={this.onChange}
            />
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

CreateOrEditApplication.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  label: PropTypes.string,
  id: PropTypes.string,
  redirect_uri: PropTypes.string,
  thumbnail: PropTypes.string,
  public: PropTypes.boolean,
  forEdit: PropTypes.boolean,
};
