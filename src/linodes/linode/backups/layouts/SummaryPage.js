import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Form, SubmitButton, FormSummary } from 'linode-components/forms';
import { Card, CardHeader } from 'linode-components/cards';

import { TimeDisplay } from '~/components';

import { TakeSnapshot } from '../components';
import { selectLinode } from '../../utilities';


export class SummaryPage extends Component {
  constructor() {
    super();

    this.state = {
      errors: {},
      loading: false,
    };
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

  render() {
    const { linode: { _backups: backups } } = this.props;

    if (!backups) {
      return null;
    }

    const daily = backups.daily;
    const snapshot = backups.snapshot &&
                     (backups.snapshot.in_progress ?
                      backups.snapshot.in_progress :
                      backups.snapshot.current) ||
                     undefined;
    const weekly = backups.weekly && backups.weekly.length ? backups.weekly[0] : undefined;
    const biweekly = backups.weekly && backups.weekly.length === 2 ? backups.weekly[1] : undefined;

    return (
      <Card header={<CardHeader title="Restorable backups" />}>
        <p>
          Select a backup to see details and restore to a Linode.
        </p>
        <div className="Backup-container row">
          <this.renderBlock title="Daily" backup={daily} />
          <this.renderBlock title="Weekly" backup={weekly} />
          <this.renderBlock title="Biweekly" backup={biweekly} />
          <this.renderBlock title="Snapshot" backup={snapshot} />
        </div>
      </Card>
    );
  }
}

SummaryPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
};

export default connect(selectLinode)(SummaryPage);
