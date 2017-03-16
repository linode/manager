import React, { PropTypes, Component } from 'react';
import _ from 'lodash';

import { ModalFormGroup } from '~/components/form';
import { showModal, hideModal } from '~/actions/modal';
import { ConfirmModalBody } from '~/components/modals';
import { Form, Input, Select, SubmitButton, CancelButton } from '~/components/form';
import { reduceErrors, ErrorSummary } from '~/errors';
import { OAUTH_SUBSCOPES, OAUTH_SCOPES } from '~/constants';
import { tokens } from '~/api';
import SelectExpiration from '../../components/SelectExpiration';

export async function renderSecret(label, verb, secret) {
  const { dispatch } = this.props;
  const close = () => dispatch(hideModal());

  await dispatch(showModal(
    `${_.capitalize(label)} ${verb}`,
    <ConfirmModalBody onOk={close} onCancel={close} buttonText="I understand">
      <div>
        <p>
          Your {label} has been {verb}. Store this secret. It won't be shown again.
        </p>
        <div className="alert alert-warning">{secret}</div>
      </div>
    </ConfirmModalBody>
  ));
}

export default class CreatePersonalAccessToken extends Component {
  constructor() {
    super();

    this.renderSecret = renderSecret.bind(this);

    this.state = {
      ...OAUTH_SCOPES.reduce((object, scope) => ({
        ...object,
        [scope]: OAUTH_SUBSCOPES[OAUTH_SUBSCOPES.length - 1],
      }), {}),
      errors: {},
      label: '',
      expiry: '0',
      saving: false,
    };
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  onSubmit = async () => {
    const { dispatch } = this.props;
    const { label, expiry } = this.state;

    const scopes = OAUTH_SUBSCOPES.reduce((scopes, scope) => {
      const level = this.state[scope];
      if (OAUTH_SUBSCOPES.indexOf(level) === -1) {
        return scopes;
      }

      return `${scopes};${scope}:${level}`;
    }, '') || undefined;

    this.setState({ errors: {}, saving: true });

    const data = { label, scopes, expiry: SelectExpiration.map(expiry) };

    try {
      const { token } = await dispatch(tokens.post(data));
      this.setState({ saving: false });

      await this.renderSecret('personal access token', 'created', token);
    } catch (response) {
      if (!response.json) {
        // eslint-disable-next-line no-console
        return console.error(response);
      }

      const errors = await reduceErrors(response);
      this.setState({ errors, saving: false });
    }
  }

  renderScopeFormGroup = (scope) => {
    return (
      <ModalFormGroup
        id={scope}
        label={_.capitalize(scope)}
        apiKey={scope}
        errors={this.state.errors}
        key={scope}
      >
        <Select
          name={scope}
          id={scope}
          value={this.state[scope]}
          onChange={this.onChange}
          options={['No Access', ...OAUTH_SUBSCOPES].reverse().map(value => ({
            value,
            label: `${_.capitalize(value)}${value === 'delete' ? ' (All Access)' : ''}`,
          }))}
        />
      </ModalFormGroup>
    );
  }

  render() {
    const { close } = this.props;
    const { errors, label, expiry, saving } = this.state;

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
        <ModalFormGroup id="expiry" label="Expires" apiKey="expiry" errors={errors}>
          <SelectExpiration
            value={expiry}
            name="expiry"
            id="expiry"
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <h3 className="sub-header">Access</h3>
        <p><small>
          Set a maximum (cascading) access level for every OAuth scope to restrict this token's
          abilities. e.g. Modify access also gives access to View.
        </small></p>
        {OAUTH_SCOPES.map(this.renderScopeFormGroup)}
        <div className="Modal-footer">
          <CancelButton onClick={close} />
          <SubmitButton disabled={saving}>Create</SubmitButton>
        </div>
        <ErrorSummary errors={errors} />
      </Form>
    );
  }
}

CreatePersonalAccessToken.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
};
