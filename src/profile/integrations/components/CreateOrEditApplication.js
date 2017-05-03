import React, { PropTypes, Component } from 'react';

import { CancelButton } from 'linode-components/buttons';
import { Form, Input, ModalFormGroup, SubmitButton } from 'linode-components/forms';

import { clients } from '~/api';
import { updateClientThumbnail } from '~/api/clients';
import { MAX_UPLOAD_SIZE_MB } from '~/constants';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';

import { renderSecret } from './CreatePersonalAccessToken';


export default class CreateOrEditApplication extends Component {
  constructor(props) {
    super(props);

    this.renderSecret = renderSecret.bind(this);

    this.state = {
      label: props.label || '',
      redirect: props.redirect || '',
      thumbnail: props.thumbnail || '',
      errors: {},
      loading: false,
    };
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  onSubmit = async () => {
    const { dispatch } = this.props;
    const { label, redirect, thumbnail } = this.state;

    await dispatch(dispatchOrStoreErrors.call(this, [
      () => this.props.saveOrCreate(label, redirect),
      ({ id, secret }) => {
        if (thumbnail) {
          if ((thumbnail.size / (1024 * 1024)) < MAX_UPLOAD_SIZE_MB) {
            return updateClientThumbnail(id, thumbnail);
          } else {
            throw { json: () => Promise.resolve({
              errors: [{
                field: 'thumbnail',
                reason: `File size must be under ${MAX_UPLOAD_SIZE_MB} MB`,
              }],
            }) };
          }
        }
      },
      ({ id, secret }) =>
        secret ? this.renderSecret('client', 'created', secret) : this.props.close(),
    ]));
  }

  render() {
    const { close } = this.props;
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
          <CancelButton onClick={close} />
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
  saveOrCreate: PropTypes.func.isRequired,
  submitText: PropTypes.string,
  submitDisabledText: PropTypes.string,
  label: PropTypes.string,
  id: PropTypes.string,
  redirect: PropTypes.string,
};

CreateOrEditApplication.defaultProps = {
  saveOrCreate: (label, redirect) => clients.post({ label, redirect_uri: redirect }),
};
