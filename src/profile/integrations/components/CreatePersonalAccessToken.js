import _ from 'lodash';
import React, { PropTypes, Component } from 'react';

import { CancelButton } from 'linode-components/buttons';
import {
  Form,
  FormSummary,
  Input,
  ModalFormGroup,
  Select,
  SubmitButton,
} from 'linode-components/forms';
import { ConfirmModalBody } from 'linode-components/modals';

import { showModal } from '~/actions/modal';
import { tokens } from '~/api';
import { OAUTH_SUBSCOPES, OAUTH_SCOPES } from '~/constants';
import { dispatchOrStoreErrors } from '~/api/util';

import SelectExpiration from '../../components/SelectExpiration';


export function renderSecret(label, verb, secret, close) {
  return showModal(
    [...label.split(' '), verb].map(_.capitalize).join(' '),
    <ConfirmModalBody
      onOk={close}
      onCancel={close}
      buttonText="I understand"
    >
      <div>
        <p>
          Your {label} has been {verb}. Store this secret. It won't be shown again.
        </p>
        <div className="alert alert-warning" id="secret">{secret}</div>
      </div>
    </ConfirmModalBody>
  );
}

export default class CreatePersonalAccessToken extends Component {
  constructor() {
    super();

    this.state = {
      ...OAUTH_SCOPES.reduce((object, scope) => ({
        ...object,
        [scope]: OAUTH_SUBSCOPES[OAUTH_SUBSCOPES.length - 1],
      }), {}),
      errors: {},
      label: '',
      expiry: '0',
      loading: false,
    };
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  onSubmit = () => {
    const { dispatch } = this.props;
    const { label, expiry } = this.state;

    const scopes = OAUTH_SCOPES.reduce((scopes, scope) => {
      const level = this.state[scope];
      if (OAUTH_SUBSCOPES.indexOf(level) === -1) {
        return scopes;
      }

      return [...scopes, `${scope}:${level}`];
    }, []).join(',') || undefined;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => tokens.post({ label, scopes, expiry: SelectExpiration.map(expiry) }),
      ({ token }) => renderSecret(
        'personal access token', 'created', token, this.props.close),
    ]));
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
    const { errors, label, expiry, loading } = this.state;

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
          <SubmitButton
            disabled={loading}
            disabledChildren="Creating"
          >Create</SubmitButton>
          <FormSummary errors={errors} />
        </div>
      </Form>
    );
  }
}

CreatePersonalAccessToken.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
};
