import React, { PropTypes, Component } from 'react';

import { CancelButton } from 'linode-components/buttons';
import { Form, Input, ModalFormGroup, SubmitButton } from 'linode-components/forms';

import { clients } from '~/api';
import { updateClientThumbnail } from '~/api/clients';
import { MAX_UPLOAD_SIZE_MB } from '~/constants';
import { FormSummary, reduceErrors } from '~/components/forms';

import { renderSecret } from './CreatePersonalAccessToken';


export default class CreateApplication extends Component {
  constructor() {
    super();

    this.renderSecret = renderSecret.bind(this);

    this.state = {
      errors: {},
      label: '',
      redirect: '',
      thumbnail: '',
      loading: false,
    };
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  onSubmit = async () => {
    const { dispatch } = this.props;
    const { label, redirect, thumbnail } = this.state;

    await dispatch(dispatchOrStoreErrors.call(this, [
      () => this.props.saveOrCreateApplication(label, redirect),
      ({ id, secret }) =>
        secret ? this.renderSecret('client', 'created', secret) : this.props.close(),
    ]));

    if (thumbnail) {
      if ((thumbnail.size / (1024 * 1024)) < MAX_UPLOAD_SIZE_MB) {
        await dispatch(dispatchOrStoreErrors.call(this, [
          () => updateClientThumbnail(id, thumbnail),
        ]));
      } else {
        this.setState({
          errors: { thumbnail: [{ reason: `File size must be under ${MAX_UPLOAD_SIZE_MB} MB` }] },
        });
      }
    }
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

CreateApplication.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  saveOrCreateApplication: PropTypes.func.isRequired,
  submitDisabledText: PropTypes.string.isRequired,
};

CreateOrEditApplication.defaultProps = {
  saveOrCreateApplication: (label, redirect) => clients.post({ label, redirect_uri: redirect }),
};
