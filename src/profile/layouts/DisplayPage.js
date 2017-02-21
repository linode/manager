import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setError } from '~/actions/errors';
import { TIME_ZONES } from '~/constants';
import { profile } from '~/api';
import { Card } from '~/components/cards';
import { Form, FormGroup, FormGroupError, SubmitButton, Input, Select } from '~/components/form';
import { ErrorSummary, reduceErrors } from '~/errors';

export class DisplayPage extends Component {
  static async preload({ dispatch }) {
    try {
      await dispatch(profile.one());
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  constructor(props) {
    super(props);
    this.timezoneOnSubmit = this.timezoneOnSubmit.bind(this);
    this.emailOnSubmit = this.emailOnSubmit.bind(this);

    // TODO refactor with abstractor changes
    const profile = this.props.profile.profile.undefined;
    this.state = {
      fetching: false,
      errors: {},
      email: profile.email,
      timezone: profile.timezone,
    };
  }

  inputOnChange = ({ target: { name, value } }) => {
    this.setState({ [name]: value });
  }

  async timezoneOnSubmit() {
    const { dispatch } = this.props;

    try {
      await dispatch(profile.put({ timezone: this.state.timezone }));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }
  }

  async emailOnSubmit() {
    const { dispatch } = this.props;
    try {
      await dispatch(profile.put({ email: this.state.email }));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }
  }

  render() {
    const { errors, timezone, email } = this.state;

    return (
      <div>
        <Card title="Change timezone">
          <Form onSubmit={this.timezoneOnSubmit}>
            <FormGroup className="row">
              <label htmlFor="timezone" className="col-sm-2 col-form-label">Timezone:</label>
              <div className="col-sm-10">
                <Select
                  id="timezone"
                  name="timezone"
                  onChange={this.inputOnChange}
                  value={timezone}
                  options={TIME_ZONES.map(zone => ({ value: zone, label: zone }))}
                />
              </div>
            </FormGroup>
            <FormGroup className="row">
              <div className="offset-sm-2 col-sm-10">
                <SubmitButton />
              </div>
            </FormGroup>
            <ErrorSummary errors={errors} />
          </Form>
        </Card>
        <Card title="Change email">
          <Form onSubmit={this.emailOnSubmit}>
            <FormGroup className="row" errors={errors} name="email">
              <label htmlFor="email" className="col-sm-2 col-form-label">Email:</label>
              <div className="col-sm-10">
                <Input
                  id="email"
                  type="email"
                  name="email"
                  onChange={this.inputOnChange}
                  value={email}
                />
                <FormGroupError errors={errors} name="email" />
              </div>
            </FormGroup>
            <FormGroup className="row">
              <div className="offset-sm-2 col-sm-10">
                <SubmitButton />
              </div>
            </FormGroup>
            <ErrorSummary errors={errors} />
          </Form>
        </Card>
      </div>
    );
  }
}

DisplayPage.propTypes = {
  dispatch: PropTypes.func,
  profile: PropTypes.object,
};

function select(state) {
  return {
    profile: state.api.profile,
  };
}

export default connect(select)(DisplayPage);
