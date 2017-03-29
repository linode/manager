import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Link } from '~/components/Link';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { takeBackup } from '~/api/backups';
import { ErrorSummary, reduceErrors } from '~/errors';
import { Button } from '~/components/buttons';
import { Card, CardHeader } from '~/components/cards';

export class SummaryPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.takeBackup = takeBackup.bind(this);
    this.state = {
      errors: {},
    };
  }

  async takeSnapshot() {
    const { id, label } = this.getLinode();
    const { dispatch } = this.props;
    try {
      const backup = await dispatch(takeBackup(id));
      dispatch(push(`/linodes/${label}/backups/${backup.id}`));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }
  }

  renderEmpty(title) {
    return (
      <div className="Backup Backup--disabled col-sm-3" key={title}>
        <div className="Backup-block">
          <div className="Backup-title">{title}</div>
          <div className="Backup-description Backup-description--muted">Pending</div>
        </div>
      </div>
    );
  }

  renderEmptySnapshot() {
    return (
      <div className="Backup Backup-emptySnapshot col-sm-3" key="Snapshot">
        <div className="Backup-block">
          <div className="Backup-title">Snapshot</div>
          <div className="Backup-description Backup-description--muted">
            No snapshots taken
          </div>
          <Button
            onClick={() => this.takeSnapshot()}
          >Take first snapshot</Button>
        </div>
      </div>
    );
  }

  renderBlock(title, backup) {
    const { params: { linodeLabel } } = this.props;

    if (backup === undefined || backup === null || backup.finished === null) {
      return title === 'Snapshot' ? this.renderEmptySnapshot() :
        this.renderEmpty(title);
    }

    const elapsed = Date.now() - Date.parse(backup.finished);
    const days = Math.ceil(elapsed / 1024 / 60 / 60 / 24);
    const unit = days === 1 ? 'day' : 'days';

    return (
      <div className="Backup col-sm-3" key={title}>
        <Link to={`/linodes/${linodeLabel}/backups/${backup.id}`}>
          <div className="Backup-block Backup-block--clickable">
            <div className="Backup-title">{title}</div>
            <div className="Backup-description">{`${days} ${unit}`}</div>
          </div>
        </Link>
      </div>
    );
  }

  render() {
    const { errors } = this.state;

    const backups = this.getLinode()._backups;
    const daily = backups.daily;
    const snapshot = backups.snapshot.in_progress ?
      backups.snapshot.in_progress : backups.snapshot.current;
    const weekly = backups.weekly.length ? backups.weekly[0] : undefined;
    const biweekly = backups.weekly.length === 2 ? backups.weekly[1] : undefined;

    const blocks = [
      this.renderBlock('Daily', daily),
      this.renderBlock('Weekly', weekly),
      this.renderBlock('Biweekly', biweekly),
      this.renderBlock('Snapshot', snapshot),
    ];

    return (
      <Card header={<CardHeader title="Restorable backups" />}>
        <div>
          Select a backup to see details and restore to a Linode.
        </div>
        <div className="Backup-container row">
          {blocks}
        </div>
        <ErrorSummary errors={errors} />
      </Card>
    );
  }
}

SummaryPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  params: PropTypes.shape({
    linodeLabel: PropTypes.string.isRequired,
  }).isRequired,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(SummaryPage);
