import React, { PropTypes, Component } from 'react';

import { CancelButton } from 'linode-components/buttons';
import { Form, FormSummary, Input, ModalFormGroup, SubmitButton } from 'linode-components/forms';

import { clients } from '~/api';
import { updateClientThumbnail } from '~/api/clients';
import { MAX_UPLOAD_SIZE_MB } from '~/constants';
import { dispatchOrStoreErrors } from '~/api/util';
import { EmitEvent } from 'linode-components/utils';

import { renderSecret } from './CreatePersonalAccessToken';


export default class CreateOrEditApplication extends Component {
  constructor(props) {
    super(props);

    this.state = {
      label: props.label || '',
      redirect: props.redirect || '',
      thumbnail: props.thumbnail || '',
      errors: {},
      loading: false,
    };
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  onSubmit = () => {
    const { dispatch, submitText, title } = this.props;
    const { label, redirect, thumbnail } = this.state;

    const data = { label, redirect_uri: redirect };
    const idsPath = [this.props.id].filter(Boolean);

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => clients[this.props.id ? 'put' : 'post'](data, ...idsPath),
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
      ({ secret }) => this.props.id ? this.props.close() :
        renderSecret('client', 'created', secret, this.props.close),
      () => { EmitEvent('modal:submit', 'Modal', submitText, title); },
    ]));
  }

  render() {
    const { close, title } = this.props;
    const { errors, label, redirect, loading } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
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
        <div className="Modal-footer">
          <CancelButton
            onClick={() => {
              EmitEvent('modal:cancel', 'Modal', 'cancel', title);
              close();
            }}
          />
          <SubmitButton
            disabled={loading}
            disabledChildren={this.props.submitDisabledText}
          >{this.props.submitText}</SubmitButton>
          <FormSummary errors={errors} />
        </div>
      </Form>
    );
  }
}

CreateOrEditApplication.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitText: PropTypes.string,
  submitDisabledText: PropTypes.string,
  label: PropTypes.string,
  id: PropTypes.string,
  redirect: PropTypes.string,
  thumbnail: PropTypes.string,
};
