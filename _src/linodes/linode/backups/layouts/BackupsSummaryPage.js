import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Form from 'linode-components/dist/forms/Form';
import SubmitButton from 'linode-components/dist/forms/SubmitButton';
import FormSummary from 'linode-components/dist/forms/FormSummary';
import Card from 'linode-components/dist/cards/Card';
import CardHeader from 'linode-components/dist/cards/CardHeader';

import TimeDisplay from '~/components/TimeDisplay';

import { TakeSnapshot } from '../components';
import { selectLinode } from '../../utilities';


export class BackupsSummaryPage extends Component {
  constructor() {
    super();

    this.state = {
      errors: {},
      loading: false,
    };
  }

  renderBlock = ({ title, backup }) => {
    const { linode } = this.props;

    if (!backup) {
      return title === 'Snapshot' ? this.renderEmptySnapshot() :
        this.renderEmpty(title);
    }

    return (
      <div className="Backup col-sm-3" key={title}>
        <Link to={`/linodes/${linode.label}/backups/${backup.id}`}>
          <div className="Backup-block Backup-block--clickable">
            <div className="Backup-title">{title}</div>
            <div className="Backup-body">
              <div className="Backup-description">
                {!backup.finished ? 'Snapshot in progress' : (
                  <TimeDisplay time={backup.finished} />
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  renderEmpty(title) {
    return (
      <div className="Backup Backup--disabled col-sm-3">
        <div className="Backup-block">
          <div className="Backup-title">{title}</div>
          <div className="Backup-body">
            <div className="Backup-description text-muted">Pending</div>
          </div>
        </div>
      </div>
    );
  }

  renderEmptySnapshot() {
    const { dispatch, linode } = this.props;
    const { loading, errors } = this.state;

    return (
      <Form
        onSubmit={() => TakeSnapshot.trigger(dispatch, linode)}
        className="Backup Backup-emptySnapshot col-sm-3"
        title="Take first snapshot"
      >
        <div className="Backup-block">
          <div className="Backup-title">Snapshot</div>
          <div className="Backup-body">
            <div className="Backup-description text-muted">
              No snapshots taken
            </div>
            <SubmitButton
              disabled={loading}
              disabledChildren="Taking first snapshot"
            >Take first snapshot</SubmitButton>
            <FormSummary errors={errors} />
          </div>
        </div>
      </Form>
    );
  }

  render() {
    const { linode: { _backups: backups } } = this.props;

    if (!backups) {
      return null;
    }
    const { automatic = [] } = backups;
    // Ew...
    const snapshot = backups.snapshot
      && (backups.snapshot.in_progress
        ? backups.snapshot.in_progress
        : backups.snapshot.current)
      || undefined;

    return (
      <Card header={<CardHeader title="Restorable backups" />}>
        <p>
          Select a backup to see details and restore to a Linode.
        </p>
        <div className="Backup-container row">
          {automatic.map((backup, index) =>
            <this.renderBlock
              key={index}
              title={`Automatic Backup ${index + 1}`}
              backup={backup}
            />)}
          <this.renderBlock title="Snapshot" backup={snapshot} />
        </div>
      </Card>
    );
  }
}

BackupsSummaryPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
};

export default connect(selectLinode)(BackupsSummaryPage);
