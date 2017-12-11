import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import {
  Form,
  FormGroup,
  FormGroupError,
  FormSummary,
  Select,
  SubmitButton,
  Textarea,
} from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';

import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { ChainedDocumentTitle } from '~/components';


export class LishPage extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      errors: {},
    };

    this.onChange = onChange.bind(this);
    this.componentWillReceiveProps = this.componentWillMount;
  }

  componentWillMount(props) {
    const {
      lish_auth_method: authorization, authorized_keys: keys,
    } = (props || this.props).profile;

    this.setState({
      authorization,
      keys: (keys || []).join('\n'),
    });
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { authorization, keys } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.profile.put({
        lish_auth_method: authorization,
        // Strip all whitespace from keys for sanity.
        authorized_keys: keys.split('\n').filter(key => key.replace(/\s/g, '').length),
      }),
    ]));
  }

  render() {
    const { errors, loading, authorization, keys } = this.state;

    const title = 'Change Lish Settings';

    const authorizationOptions = [
      { value: 'password_keys', label: 'Allow both password and key authorization' },
      { value: 'keys_only', label: 'Allow key authentication only' },
      { value: 'disabled', label: 'Disable Lish' },
    ];

    return (
      <div>
        <ChainedDocumentTitle title="Lish" />
        <Card header={<CardHeader title="Change Lish settings" />}>
          <Form
            onSubmit={this.onSubmit}
            analytics={{ title }}
          >
            <FormGroup className="row" errors={errors} name="lish_auth_method">
              <label htmlFor="authorization" className="col-sm-2 col-form-label">
                Authorization mode
              </label>
              <div className="col-sm-10">
                <Select
                  id="authorization"
                  name="authorization"
                  onChange={this.onChange}
                  value={authorization}
                  className="input-md"
                  options={authorizationOptions}
                />
                <FormGroupError errors={errors} name="lish_auth_method" />
              </div>
            </FormGroup>
            <FormGroup className="row" errors={errors} name="authorized_keys">
              <label htmlFor="keys" className="col-sm-2 col-form-label">Lish keys:</label>
              <div className="col-sm-10">
                <Textarea
                  id="keys"
                  className="textarea-md"
                  name="keys"
                  value={keys}
                  onChange={this.onChange}
                />
                <div>
                  <small className="text-muted">
                    Place your SSH public keys here, one per line, for use with Lish console access.
                  </small>
                </div>
                <FormGroupError errors={errors} name="authorized_keys" inline={false} />
              </div>
            </FormGroup>
            <FormGroup className="row">
              <div className="offset-sm-2 col-sm-10">
                <SubmitButton disabled={loading} />
                <FormSummary errors={errors} success="Lish settings saved." />
              </div>
            </FormGroup>
          </Form>
        </Card>
      </div>
    );
  }
}

LishPage.propTypes = {
  dispatch: PropTypes.func,
  profile: PropTypes.object,
};

function select(state) {
  return {
    profile: state.api.profile,
  };
}

export default connect(select)(LishPage);
