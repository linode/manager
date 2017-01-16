import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Link } from '~/components/Link';

import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { takeBackup } from '~/api/backups';
import { ErrorSummary, reduceErrors } from '~/errors';
import { Button } from '~/components/buttons';

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
      <div className="col-sm-3" key={title}>
        <div className="backup-block">
          <div className="title">{title}</div>
          <div className="description text-dark-gray">Pending</div>
        </div>
      </div>
    );
  }

  renderEmptySnapshot() {
    return (
      <div className="col-sm-3" key="Snapshot">
        <div className="backup-block">
          <div className="title">Snapshot</div>
          <div className="no-snapshot text-dark-gray">
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

    if (backup === undefined || backup.finished === null) {
      return title === 'Snapshot' ? this.renderEmptySnapshot() :
        this.renderEmpty(title);
    }

    const elapsed = Date.now() - Date.parse(backup.finished);
    const days = Math.ceil(elapsed / 1024 / 60 / 60 / 24);
    const unit = days === 1 ? 'day' : 'days';

    return (
      <div className="col-sm-3" key={title}>
        <Link to={`/linodes/${linodeLabel}/backups/${backup.id}`}>
          <div className="backup-block clickable">
            <div className="title">{title}</div>
            <div className="description">{`${days} ${unit}`}</div>
          </div>
        </Link>
      </div>
    );
  }

  render() {
    const { errors } = this.state;

    const backups = Object.values(this.getLinode()._backups.backups);
    backups.sort((a, b) => a.created > b.created);

    const daily = backups.find(b => b.availability === 'daily');
    const snapshot = backups.find(b => b.type === 'snapshot');

    const weeklies = backups.filter(b => b.availability === 'weekly');
    weeklies.sort((a, b) => Date.parse(b.created) - Date.parse(a.created));

    const weekly = weeklies.length >= 1 ? weeklies[0] : undefined;
    const biweekly = weeklies.length >= 2 ? weeklies[1] : undefined;

    const blocks = [
      this.renderBlock('Daily', daily),
      this.renderBlock('Weekly', weekly),
      this.renderBlock('Biweekly', biweekly),
      this.renderBlock('Snapshot', snapshot),
    ];

    return (
      <section className="card">
        <header>
          <h2>Restorable backups</h2>
        </header>
        <div className="form-group">
          Select a backup to see details and restore to a Linode.
        </div>
        <div className="form-group row">
          {blocks}
        </div>
        <ErrorSummary errors={errors} />
      </section>
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
