import React, { PropTypes, Component } from 'react';

import { MAX_UPLOAD_SIZE_MB } from '~/constants';
import { clients } from '~/api';
import { updateClientThumbnail } from '~/api/clients';
import { ModalFormGroup } from '~/components/form';
import { Form, Input, SubmitButton, CancelButton } from '~/components/form';
import { reduceErrors, ErrorSummary } from '~/errors';

export default class CreateApplication extends Component {
  constructor() {
    super();

    this.submitText = 'Create OAuth Application';

    this.state = {
      errors: {},
      label: '',
      redirect: '',
      thumbnail: '',
    };
  }

  onChange = ({ target: { label, value } }) => this.setState({ [label]: value })

  onSubmit = async () => {
    const { dispatch } = this.props;
    const { label, redirect, thumbnail } = this.state;

    this.setState({ errors: {} });

    try {
      const r = await this.submitAction(label, redirect);
      const { id } = r;

      if (thumbnail) {
        if ((thumbnail.size / (1024 * 1024)) < MAX_UPLOAD_SIZE_MB) {
          await dispatch(updateClientThumbnail(id, thumbnail));
        } else {
          this.setState({
            errors: { thumbnail: [{ reason: `File size must be under ${MAX_UPLOAD_SIZE_MB} MB` }] },
          });
          return;
        }
      }

      this.setState({ saving: false });
      this.props.close();
    } catch (response) {
      if (!response.json) {
        // eslint-disable-next-line no-console
        console.error(response);
      }

      const errors = await reduceErrors(response);
      this.setState({ errors, saving: false });
    }
  }

  submitAction = async (label, redirect) =>
    this.props.dispatch(clients.post({ label, redirect_uri: redirect }))

  render() {
    const { close } = this.props;
    const { errors, label, redirect, saving } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <ModalFormGroup id="label" label="label" apiKey="label" errors={errors}>
          <Input
            label="label"
            id="label"
            placeholder="My client"
            value={label}
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <ModalFormGroup id="redirect" label="Redirect URI" apiKey="redirect_uri" errors={errors}>
          <Input
            label="redirect"
            id="redirect"
            placeholder="http://localhost:3000/oauth/callback"
            value={redirect}
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <ModalFormGroup id="thumbnail" label="Thumbnail" apiKey="thumbnail" errors={errors}>
          <Input
            label="thumbnail"
            id="thumbnail"
            type="file"
            onChange={(e) => this.setState({ thumbnail: e.target.files[0] })}
          />
        </ModalFormGroup>
        <div classlabel="Modal-footer">
          <CancelButton onClick={close} />
          <SubmitButton disabled={saving}>{this.submitText}</SubmitButton>
        </div>
        <ErrorSummary errors={errors} />
      </Form>
    );
  }
}

CreateApplication.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
};
