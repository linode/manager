import React, { Component, PropTypes } from 'react';
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

import { profile } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';


export default class LishPage extends Component {
  constructor() {
    super();

    this.componentWillReceiveProps = this.componentWillMount;

    this.state = {
      loading: false,
      errors: {},
    };
  }

  componentWillMount() {
    this.setState({
      authorization: this.props.profile.lish_auth_method,
      keys: this.props.profile.authorized_keys || '',
    });
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { authorization, keys } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => profile.put({
        lish_auth_method: authorization,
        authorized_keys: keys,
      }),
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { errors, loading, authorization, keys } = this.state;

    const title = 'Change Lish Settings';

    const authorizationOptions = [
      { value: '0', label: 'Allow both password and key authorization' },
      { value: '1', label: 'Allow key authentication only' },
      { value: '2', label: 'Disable Lish' },
    ];

    return (
      <div>
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
                  options={authorizationOptions}
                />
                <FormGroupError errors={errors} name="mode" />
                >
                  <option value="0">Allow both password and key authorization</option>
                  <option value="1">Allow key authentication only</option>
                  <option value="2">Disable Lish</option>
                </Select>
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
                    Place your SSH public keys here for use with Lish console access.
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
