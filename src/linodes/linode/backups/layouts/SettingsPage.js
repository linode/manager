import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { ErrorSummary, FormGroup, reduceErrors } from '~/errors';
import { linodes } from '~/api';
import { cancelBackup } from '~/api/backups';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { setSource } from '~/actions/source';
import { showModal, hideModal } from '~/actions/modal';

export class CancelBackupsModal extends Component {
  constructor() {
    super();
    this.state = { loading: false };
  }

  render() {
    const { dispatch, linodeId } = this.props;
    const { loading } = this.state;
    return (
      <div>
        <p>
          Are you sure you want to cancel backup service for this Linode?
          This cannot be undone.
        </p>
        <div className="modal-footer">
          <button
            className="btn btn-cancel"
            disabled={loading}
            onClick={() => dispatch(hideModal())}
          >Cancel</button>
          <button
            className="btn btn-default"
            disabled={loading}
            onClick={async () => {
              this.setState({ loading: true });
              await dispatch(cancelBackup(linodeId));
              this.setState({ loading: false });
              dispatch(hideModal());
            }}
          >Cancel backups service</button>
        </div>
      </div>);
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
    this.onSubmit = this.onSubmit.bind(this);
    const { day, window } = this.getLinode().backups.schedule;
    this.state = { day, window, errors: {} };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  async onSubmit(e) {
    e.preventDefault();
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
          <form>
            <FormGroup errors={errors} className="row" field="window">
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
            <FormGroup errors={errors} className="row" field="day">
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
            <button className="btn btn-default" onClick={this.onSubmit}>
              Save
            </button>
          </form>
        </section>
        <section className="card">
          <header>
            <h2>Cancel backup service</h2>
          </header>
          <p>This will remove all existing backups.</p>
          <button
            className="btn btn-delete btn-default"
            onClick={() => dispatch(showModal('Cancel backup service', cancelModal(linode.id)))}
          >
            Cancel backup service
          </button>
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
