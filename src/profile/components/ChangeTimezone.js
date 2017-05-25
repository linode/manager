import moment from 'moment-timezone';
import React, { PropTypes, Component } from 'react';

import { Card, CardHeader } from 'linode-components/cards';
import { Form, FormGroup, Select, SubmitButton } from 'linode-components/forms';

import { profile } from '~/api';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';
import { setStorage } from '~/storage';


const timezones = moment.tz.names();

export default class ChangeTimezone extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      errors: {},
      timezone: props.timezone,
    };
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { timezone } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => profile.put({ timezone }),
      () => setStorage('profile/timezone', timezone),
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { loading, errors, timezone } = this.state;

    return (
      <Card header={<CardHeader title="Change timezone" />}>
        <Form onSubmit={this.onSubmit}>
          <FormGroup className="row">
            <label htmlFor="timezone" className="col-sm-2 col-form-label">Timezone</label>
            <div className="col-sm-10">
              <Select
                id="timezone"
                name="timezone"
                onChange={this.onChange}
                value={timezone}
                options={timezones.map(zone => ({ value: zone, label: zone }))}
              />
              <div>
                <small className="text-muted">
                  This timezone setting is unique to this app. Any timezone setting in the classic
                  Manager will not be reflected here.
                </small>
              </div>
            </div>
          </FormGroup>
          <FormGroup className="row">
            <div className="offset-sm-2 col-sm-10">
              <SubmitButton disabled={loading} />
              <FormSummary errors={errors} success="Timezone saved." />
            </div>
          </FormGroup>
        </Form>
      </Card>
    );
  }
}

ChangeTimezone.propTypes = {
  timezone: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};
