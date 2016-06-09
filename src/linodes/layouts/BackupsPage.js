import React, { Component, PropTypes } from 'react';
import { updateLinode } from '~/actions/api/linodes';
import { connect } from 'react-redux';
import HelpButton from '~/components/HelpButton';

export class BackupsPage extends Component {
  constructor() {
    super();
    this.componentDidMount = this.componentDidMount.bind(this);
    this.getLinode = this.getLinode.bind(this);
    this.renderNotEnabled = this.renderNotEnabled.bind(this);
    this.renderEnabled = this.renderEnabled.bind(this);
    this.renderSchedule = this.renderSchedule.bind(this);
    this.renderBackupsTable = this.renderBackupsTable.bind(this);
    this.renderLastManualBackup = this.renderLastManualBackup.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const linode = this.getLinode();
    if (!linode) {
      const { linodeId } = this.props.params;
      dispatch(updateLinode(linodeId));
    }
  }

  getLinode() {
    const { linodes } = this.props.linodes;
    const { linodeId } = this.props.params;
    return linodes[linodeId];
  }

  renderBackupsTable() {
    const backups = [/* temp */];
    if (backups.length === 0) {
      return (
        <p>
          No backups yet.
          First automated backup is scheduled for {'8 hours'/* TODO */} from now.
        </p>
      );
    }
    return (
      <div>TODO</div>
    );
  }

  renderSchedule() {
    return (
      <div className="backup-schedule">
        <div className="form-group row">
          <label htmlFor="schedule" className="col-md-4 form-control-label">
            {/* TODO: Use user time settings */}
            Time of Day (EST):
          </label>
          <div className="col-md-4">
            <select className="form-control" id="schedule">
              <option>12-2 AM</option>
              <option>2-4 AM</option>
              <option>4-6 AM</option>
              <option>6-8 AM</option>
              <option>8-10 AM</option>
              <option>10 AM-12 PM</option>
              <option>12-2 PM</option>
              <option>2-4 PM</option>
              <option>4-6 PM</option>
              <option>6-8 PM</option>
              <option>8-10 PM</option>
              <option>10 PM-12 AM</option>
            </select>
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="dow" className="col-md-4 form-control-label">
            Day of week:
          </label>
          <div className="col-md-4">
            <select className="form-control" id="dow">
              <option>Sunday</option>
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
              <option>Saturday</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div className="col-md-8">
            <p className="text-muted">
              The weekly and bi-weekly backups store the one
              and two week old backup created this day, respectively.
            </p>
            <button
              className="btn btn-primary"
            >Save</button>
            <button
              className="btn btn-danger-outline"
            >Cancel Backups</button>
          </div>
        </div>
      </div>
    );
  }

  renderLastManualBackup() {
    const lastManualBackup = null; // TODO
    if (lastManualBackup) {
      return (
        <p>TODO</p>
      );
    }
    return <p>No manual backups have been taken yet.</p>;
  }

  renderEnabled() {
    return (
      <div>
        <h2>Details and restore</h2>
        {this.renderBackupsTable()}
        <hr />
        <div className="row">
          <div className="col-md-6">
            <h2>
              Schedule
              <HelpButton to="http://example.org" />
            </h2>
            {this.renderSchedule()}
          </div>
          <div className="col-md-6">
            <h2>Manual Backup</h2>
            {this.renderLastManualBackup()}
            <button
              className="btn btn-primary"
            >Take Backup</button>
          </div>
        </div>
      </div>
    );
  }

  renderNotEnabled() {
    return (
      <div>
        <p>Backups are not enabled for this Linode.</p>
        <button
          className="btn btn-primary"
        >Enable backups</button>
        <HelpButton to="http://example.org" />
      </div>
    );
  }

  render() {
    return this.renderEnabled();
  }
}

BackupsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.array.isRequired,
  params: PropTypes.shape({
    linodeId: PropTypes.string.isRequired,
  }).isRequired,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(BackupsPage);
