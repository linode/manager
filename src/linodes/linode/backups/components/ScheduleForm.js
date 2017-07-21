import React, { Component, PropTypes } from 'react';

import {
  Form,
  FormGroup,
  FormGroupError,
  FormSummary,
  Select,
  SubmitButton,
} from 'linode-components/forms';

import { linodes } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';


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

  onSubmit = () => {
    const { dispatch, linode } = this.props;
    const { day, window } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => linodes.put({ backups: { schedule: { day, window } } }, linode.id),
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { errors, loading, window, day } = this.state;

    const windowOptions = [
      { value: 'W0', label: '12AM - 2AM' },
      { value: 'W2', label: '2AM - 4AM' },
      { value: 'W4', label: '4AM - 6AM' },
      { value: 'W6', label: '6AM - 8AM' },
      { value: 'W8', label: '8AM - 10AM' },
      { value: 'W10', label: '10AM - 12PM' },
      { value: 'W12', label: '12PM - 2PM' },
      { value: 'W14', label: '2PM - 4PM' },
      { value: 'W16', label: '4PM - 6PM' },
      { value: 'W18', label: '6PM - 8PM' },
      { value: 'W20', label: '8PM - 10PM' },
      { value: 'W22', label: '10PM - 12AM' },
    ];

    const dayOptions = [
      { value: 'Sunday', label: 'Sunday' },
      { value: 'Monday', label: 'Monday' },
      { value: 'Tuesday', label: 'Tuesday' },
      { value: 'Wednesday', label: 'Wednesday' },
      { value: 'Thursday', label: 'Thursday' },
      { value: 'Friday', label: 'Friday' },
      { value: 'Saturday', label: 'Saturday' },
    ];

    return (
      <Form
        onSubmit={this.onSubmit}
        analytics={{ title: 'Backups Schedule' }}
      >
        <FormGroup name="window" errors={errors} className="row">
          <label htmlFor="window" className="col-sm-2 col-form-label">Time of Day (EST)</label>
          <div className="col-sm-10">
            <Select
              id="window"
              name="window"
              value={window || ''}
              onChange={this.onChange}
              options={windowOptions}
            />
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
              options={dayOptions}
            />
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
  linode: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
