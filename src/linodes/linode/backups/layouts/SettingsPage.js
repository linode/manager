import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { FormGroup } from '~/components/form';
import { ErrorSummary, reduceErrors } from '~/errors';
import { linodes } from '~/api';
import { cancelBackup } from '~/api/backups';
import { Form, SubmitButton } from '~/components/form';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { setSource } from '~/actions/source';
import { showModal, hideModal } from '~/actions/modal';
import { Button } from '~/components/buttons';
import ConfirmModalBody from '~/components/modals/ConfirmModalBody';

export class CancelBackupsModal extends Component {
  constructor() {
    super();
    this.state = { loading: false };
  }

  render() {
    const { dispatch, linodeId } = this.props;
    return (
      <ConfirmModalBody
        buttonText="Cancel backups service"
        onOk={async () => {
          this.setState({ loading: true });
          await dispatch(cancelBackup(linodeId));
          this.setState({ loading: false });
          dispatch(hideModal());
        }}
        onCancel={() => dispatch(hideModal())}
      >
        <p>
          Are you sure you want to cancel backup service for this Linode?
          This cannot be undone.
        </p>
      </ConfirmModalBody>);
  }
}

CancelBackupsModal.propTypes = {
  linodeId: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export class SettingsPage extends Component {
  constructor(props) {
    super(props);
    this.getLinode = getLinode.bind(this);
    const { day, window } = this.getLinode().backups.schedule;
    this.state = { day, window, errors: {} };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  async saveChanges() {
    const { dispatch } = this.props;
    const linode = this.getLinode();
    const { day, window } = this.state;
    try {
      await dispatch(linodes.put({
        backups: {
          schedule: { day, window },
        },
      }, linode.id));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }
  }

  render() {
    const { dispatch } = this.props;
    const { window, day, errors } = this.state;
    const linode = this.getLinode();

    const cancelModal = linodeId => (
      <CancelBackupsModal linodeId={linodeId} dispatch={dispatch} />
    );

    return (
      <div>
        <section className="card">
          <header>
            <h2>Schedule</h2>
          </header>
          <Form onSubmit={() => this.saveChanges()}>
            <FormGroup errors={errors} className="row" name="window">
              <div className="col-sm-2">
                <label htmlFor="window">Time of day (EST):</label>
              </div>
              <div className="col-sm-4">
                <select
                  className="form-control"
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
            <FormGroup errors={errors} className="row" name="day">
              <div className="col-sm-2">
                <label htmlFor="day">Day of week:</label>
              </div>
              <div className="col-sm-4">
                <select
                  className="form-control"
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
            <ErrorSummary errors={errors} />
            <SubmitButton />
          </Form>
        </section>
        <section className="card">
          <header>
            <h2>Cancel backup service</h2>
          </header>
          <p>This will remove all existing backups.</p>
          <Button
            onClick={() => dispatch(showModal('Cancel backup service', cancelModal(linode.id)))}
          >
            Cancel backup service
          </Button>
        </section>
      </div>
    );
  }
}

SettingsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  params: PropTypes.shape({
    linodeLabel: PropTypes.string.isRequired,
  }).isRequired,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(SettingsPage);
