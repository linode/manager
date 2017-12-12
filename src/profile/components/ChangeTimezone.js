import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Card, CardHeader } from 'linode-components';
import {
  Form,
  FormGroup,
  FormSummary,
  Select,
  SubmitButton,
} from 'linode-components';
import { onChange } from 'linode-components';

import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
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

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { timezone } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.profile.put({ timezone }),
      () => setStorage('profile/timezone', timezone),
    ]));
  }

  render() {
    const { loading, errors, timezone } = this.state;

    return (
      <Card header={<CardHeader title="Change timezone" />}>
        <Form
          onSubmit={this.onSubmit}
          analytics={{ title: 'Timezone Settings' }}
        >
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
