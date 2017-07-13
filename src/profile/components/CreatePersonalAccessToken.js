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
import { EmitEvent } from 'linode-components/utils';

import { showModal, hideModal } from '~/actions/modal';
import { tokens } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { OAUTH_SUBSCOPES, OAUTH_SCOPES } from '~/constants';

import SelectExpiration from './SelectExpiration';
import { formatScope } from '../utilities';


export function renderSecret(label, verb, secret, close) {
  const title = [...label.split(' '), verb].map(_.capitalize).join(' ');
  return showModal(title,
    <ConfirmModalBody
      onOk={() => {
        EmitEvent('modal:submit', 'Modal', 'I understand', title);
        close();
      }}
      onCancel={() => {
        EmitEvent('modal:submit', 'Modal', 'cancel', title);
        close();
      }}
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
  static title = 'Create a Personal Access Token'

  static trigger(dispatch) {
    return dispatch(showModal(CreatePersonalAccessToken.title, (
      <CreatePersonalAccessToken
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
      />
    )));
  }

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
    }, []).join(',') || ''; // '' allows no scopes. undefined copies current scopes.

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => tokens.post({ label, scopes, expiry: SelectExpiration.map(expiry) }),
      () => { EmitEvent('modal:submit', 'Modal', 'create', CreatePersonalAccessToken.title); },
      ({ token }) => renderSecret(
        'personal access token', 'created', token, this.props.close),
    ]));
  }

  renderScopeFormGroup = (scope) => {
    return (
      <ModalFormGroup
        id={scope}
        label={formatScope(scope)}
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
    const { close, title } = this.props;
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
          <CancelButton
            onClick={() => {
              EmitEvent('modal:cancel', 'Modal', 'cancel', title);
              close();
            }}
          />
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
  title: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
};
