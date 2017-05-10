import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Link } from 'react-router';

import { Form, SubmitButton } from 'linode-components/forms';
import { Card, CardHeader } from 'linode-components/cards';

import { takeBackup } from '~/api/backups';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';

import { selectLinode } from '../../utilities';


export class SummaryPage extends Component {
  constructor() {
    super();

    this.state = {
      errors: {},
      loading: false,
    };
  }

  onSubmit = () => {
    const { dispatch, linode } = this.props;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => takeBackup(linode.id),
      ({ id }) => push(`/linodes/${linode.label}/backups/${id}`),
    ]));
  }

  renderEmpty(title) {
    return (
      <div className="Backup Backup--disabled col-sm-3">
        <div className="Backup-block">
          <div className="Backup-title">{title}</div>
          <div className="Backup-description Backup-description--muted">Pending</div>
        </div>
      </div>
    );
  }

  renderEmptySnapshot() {
    const { loading, errors } = this.state;

    return (
      <Form onSubmit={this.onSubmit} className="Backup Backup-emptySnapshot col-sm-3">
        <div className="Backup-block">
          <div className="Backup-title">Snapshot</div>
          <div className="Backup-description Backup-description--muted">
            No snapshots taken
          </div>
          <SubmitButton
            disabled={loading}
            disabledChildren="Taking first snapshot"
          >Take first snapshot</SubmitButton>
          <FormSummary errors={errors} />
        </div>
      </Form>
    );
  }

  renderBlock({ title, backup }) {
    const { linode } = this.props;

    if (backup === undefined || backup === null || backup.finished === null) {
      return title === 'Snapshot' ? this.renderEmptySnapshot() :
        this.renderEmpty(title);
    }

    const elapsed = Date.now() - Date.parse(backup.finished);
    const days = Math.ceil(elapsed / 1024 / 60 / 60 / 24);
    const unit = days === 1 ? 'day' : 'days';

    return (
      <div className="Backup col-sm-3" key={title}>
        <Link to={`/linodes/${linode.label}/backups/${backup.id}`}>
          <div className="Backup-block Backup-block--clickable">
            <div className="Backup-title">{title}</div>
            <div className="Backup-description">{`${days} ${unit}`}</div>
          </div>
        </Link>
      </div>
    );
  }

  render() {
    const { linode: { _backups: backups } } = this.props;

    const daily = backups.daily;
    const snapshot = backups.snapshot.in_progress ?
      backups.snapshot.in_progress : backups.snapshot.current;
    const weekly = backups.weekly.length ? backups.weekly[0] : undefined;
    const biweekly = backups.weekly.length === 2 ? backups.weekly[1] : undefined;

    return (
      <Card header={<CardHeader title="Restorable backups" />}>
        <div>
          Select a backup to see details and restore to a Linode.
        </div>
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
