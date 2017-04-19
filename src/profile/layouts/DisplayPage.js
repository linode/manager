import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { profile } from '~/api';

import { Card, CardHeader } from 'linode-components/cards';
import { reduceErrors } from '~/errors';

import { TimezoneForm, EmailForm } from '~/profile/display/components';

export class DisplayPage extends Component {

  constructor(props) {
    super(props);
    this.timezoneOnSubmit = this.timezoneOnSubmit.bind(this);
    this.emailOnSubmit = this.emailOnSubmit.bind(this);

    this.state = {
      fetching: false,
      errors: {},
      email: props.profile.email,
      timezone: props.profile.timezone,
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
    const { errors } = this.state;

    return (
      <div>
        <Card header={<CardHeader title="Change timezone" />}>
          <TimezoneForm
            timezone={this.state.timezone}
            errors={errors}
            onSubmit={this.timezoneOnSubmit}
            onChange={this.inputOnChange}
          />
        </Card>
        <Card header={<CardHeader title="Change email" />}>
          <EmailForm
            errors={errors}
            email={this.state.email}
            onSubmit={this.emailOnSubmit}
            onChange={this.inputOnChange}
          />
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
