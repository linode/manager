import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { FormGroup } from 'linode-components/forms';
import { ErrorSummary, reduceErrors } from '~/errors';
import { linodes } from '~/api';
import { cancelBackup } from '~/api/backups';
import { Card, CardHeader } from 'linode-components/cards';
import { ConfirmModalBody } from 'linode-components/modals';
import { Form, SubmitButton } from 'linode-components/forms';
import { selectLinode } from '../../utilities';
import { setSource } from '~/actions/source';
import { showModal, hideModal } from '~/actions/modal';


export class SettingsPage extends Component {
  constructor(props) {
    super(props);

    const { day, window } = props.linode.backups.schedule;
    this.state = { day, window, errors: {} };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  async saveChanges() {
    const { dispatch, linode } = this.props;
    const { day, window } = this.state;

    await dispatch(dispatchOrStoreErrors.apply(this, [
      [() => linodes.put({ backups: { schedule: { day, window } } }, id)],
    ]));
  }

  render() {
    const { dispatch, linode } = this.props;
    const { window, day, errors } = this.state;

    return (
      <div>
        <Card header={<CardHeader title="Schedule" />}>
          <Form onSubmit={this.onSubmit}>
            <FormGroup name="window" errors={errors} className="row">
              <label htmlFor="window" className="col-sm-2 col-form-label">Time of day (EST)</label>
              <div className="col-sm-4">
                <select
                  className="form-control"
                  id="window"
                  name="window"
                  value={window}
                  onChange={e => this.setState({ window: e.target.value })}
                >
                  <option value="W0">12-2 AM</option>
                  <option value="W2">2-4 AM</option>
                  <option value="W4">4-6 AM</option>
                  <option value="W6">6-8 AM</option>
                  <option value="W8">8-10 AM</option>
                  <option value="W10">10-12 AM</option>
                  <option value="W12">12-2 PM</option>
                  <option value="W14">2-4 PM</option>
                  <option value="W16">4-6 PM</option>
                  <option value="W18">6-8 PM</option>
                  <option value="W20">8-10 PM</option>
                  <option value="W22">10-12 PM</option>
                </select>
              </div>
            </FormGroup>
            <FormGroup name="day" errors={errors} className="row">
              <label htmlFor="day" className="col-sm-2 col-form-label">Day of week</label>
              <div className="col-sm-4">
                <select
                  className="form-control"
                  id="day"
                  name="day"
                  value={day}
                  onChange={e => this.setState({ day: e.target.value })}
                >
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>
            </FormGroup>
            <FormGroup className="row">
              <div className="offset-sm-2 col-sm-10">
                <SubmitButton disabled={loading} />
                <FormSummary errors={errors} success="Schedule settings saved." />
              </div>
            </FormGroup>
          </Form>
        </Card>
        <Card header={<CardHeader title="Cancel backup service" />}>
          <p>This will remove all existing backups.</p>
          <button
            id="backup-settings-cancel"
            className="btn btn-delete btn-default"
            onClick={() => {
              dispatch(showModal('Cancel backup service', <ConfirmModalBody
                onOk={async() => {
                  await dispatch(cancelBackup(linode.id));
                  dispatch(hideModal());
                }}
                onCancel={() => dispatch(hideModal())}
                buttonText="Cancel backups service"
                buttonDisabledText="Cancelling backups service"
              >
                Are you sure you want to cancel backup service for this Linode?
                This cannot be undone.
              </ConfirmModalBody>));
            }}
          >
            Cancel backup service
          </button>
        </Card>
      </div>
    );
  }
}

SettingsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
};

export default connect(selectLinode)(SettingsPage);
