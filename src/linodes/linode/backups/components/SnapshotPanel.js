import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { fetchBackups, takeBackup } from '~/actions/api/backups';
import { fetchLinode, fetchLinodes, putLinode } from '~/actions/api/linodes';
import moment from 'moment';

export class SnapshotPanel extends Component {
  constructor() {
    super();
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  async componentDidMount() { 
    const { dispatch, linodes } = this.props;
    if (linodes.totalPages === -1) {
      await dispatch(fetchLinodes());
    }
    let linode = this.getLinode();
    if (!linode) {
      const linodeId = parseInt(this.props.params.linodeId);
      await dispatch(fetchLinode(parseInt(linodeId)));
    }
    linode = this.getLinode();
    if (linode._backups.totalPages === -1) {
      await dispatch(fetchBackups(0, linode.id));
    }
  }

  render() {
    const { snapshot } = this.props;
    /* TODO:
     * Waiting on endpoint update for:
     * - Config Profiles
     * - Disks
     * - Space Required
        dispatch(takeBackup(thisLinode.id));
     */
    if(!snapshot) { 
      return (
        <section className="card">
          <header>
            <h2>Snapshot</h2>
          </header>
          <div className="form-group row snapshot-button">
            <div className="col-sm-12 label-col left">
              <form>
                <button type="submit" className="btn btn-primary">
                  Take Snapshot
                </button>
              </form>
            </div>
          </div>
        </section>
      );
    }

    const duration = moment(snapshot.finished).diff(moment(snapshot.created));
    const durationMinutes = moment.duration(duration).asMinutes();

    let durationText = `${Math.round(durationMinutes)} minutes`;
    if(durationMinutes >= 60) {
      durationText = `${Math.floor(durationMinutes / 60)} hours ${Math.round(durationMinutes % 60)} minutes`;
    }

    return (
      <section className="card">
        <header>
          <h2>Snapshot</h2>
        </header>
        { snapshot.label ?
          <div className="form-group row label">
            <div className="col-sm-2 label-col left">Label</div>
            <div className="col-sm-10 content-col right">
              {snapshot.label}
            </div>
          </div>
          : null
        }
        <div className="form-group row started">
          <div className="col-sm-2 label-col left">Started</div>
          <div className="col-sm-10 content-col right">
            {moment(snapshot.created).format('dddd, MMMM D YYYY LT')}
          </div>
        </div>
        <div className="form-group row finished">
          <div className="col-sm-2 label-col left">Finished</div>
          <div className="col-sm-10 content-col right">
            {moment(snapshot.finished).format('dddd, MMMM D YYYY LT')}
          </div>
        </div>
        <div className="form-group row duration">
          <div className="col-sm-2 label-col left">Duration</div>
          <div className="col-sm-10 content-col right">
            {durationText}
          </div>
        </div>
        <div className="form-group row">
          <div className="col-sm-2 label-col left">Datecenter constraint</div>
          <div className="col-sm-10 content-col right">{snapshot.datacenter.label}</div>
        </div>
        <div className="form-group row snapshot-button">
          <div className="col-sm-12 label-col left">
            <form onSubmit={onSubmit(linodeId)}>
              <button type="submit" className="btn btn-primary">
                Take Snapshot
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }
}

SnapshotPanel.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  params: PropTypes.shape({
    linodeId: PropTypes.string.isRequired,
  }).isRequired,
  snapshot: PropTypes.object.isRequired,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(SnapshotPanel);
