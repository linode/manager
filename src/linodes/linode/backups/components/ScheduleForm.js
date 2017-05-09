import React, { Component, PropTypes } from 'react';

import { Form, FormGroup, FormGroupError, Select, SubmitButton } from 'linode-components/forms';

import { linodes } from '~/api';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';


export default class ScheduleForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errors: {},
      loading: false,
      window: props.window,
      day: props.day,
    };
  }

  onSubmit = async () => {
    const { dispatch } = this.props;
    const { day, window } = this.state;

    await dispatch(dispatchOrStoreErrors.call(this, [
      () => linodes.put({ backups: { schedule: { day, window } } }, id),
    ]))
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { errors, loading, window, day } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <FormGroup name="window" errors={errors} className="row">
          <label htmlFor="window" className="col-sm-2 col-form-label">Time of Day (EST)</label>
          <div className="col-sm-10">
            <Select id="window" name="window" value={window} onChange={this.onChange}>
              <option value="W0">12AM - 2AM</option>
              <option value="W2">2AM - 4AM</option>
              <option value="W4">4AM - 6AM</option>
              <option value="W6">6AM - 8AM</option>
              <option value="W8">8AM - 10AM</option>
              <option value="W10">10AM - 12PM</option>
              <option value="W12">12PM - 2PM</option>
              <option value="W14">2PM - 4PM</option>
              <option value="W16">4PM - 6PM</option>
              <option value="W18">6PM - 8PM</option>
              <option value="W20">8PM - 10PM</option>
              <option value="W22">10PM - 12AM</option>
            </Select>
            <FormGroupError errors={errors} name="day" />
          </div>
        </FormGroup>
        <FormGroup name="day" errors={errors} className="row">
          <label htmlFor="day" className="col-sm-2 col-form-label">Day of Week</label>
          <div className="col-sm-10 clearfix">
            <Select
              id="day"
              name="day"
              value={day}
              onChange={this.onChange}
              className="float-sm-left"
            >
              <option value="Sunday">Sunday</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
            </Select>
            <FormGroupError errors={errors} name="day" />
          </div>
        </FormGroup>
        <FormGroup className="row">
          <div className="offset-sm-2 col-sm-10">
            <SubmitButton disabled={loading} />
            <FormSummary errors={errors} success="Schedule settings saved." />
          </div>
        </FormGroup>
      </Form>
    );
  }
}

ScheduleForm.propTypes = {
  window: PropTypes.string.isRequired,
  day: PropTypes.string.isRequired,
};
