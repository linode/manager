import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from '~/components/Link';

import { getLinode } from '~/linodes/linode/layouts/IndexPage';

export class SummaryPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
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

  renderBlock(title, backup) {
    if (backup === undefined || backup.finished === null) {
      return this.renderEmpty(title);
    }

    const elapsed = Date.now() - Date.parse(backup.finished);
    const days = Math.ceil(elapsed / 1024 / 60 / 60 / 24);
    const unit = days === 1 ? 'day' : 'days';

    return (
      <div className="col-sm-3" key={title}>
        <Link to={`${backup.id}`}>
          <div className="backup-block clickable">
            <div className="title">{title}</div>
            <div className="description">{`${days} ${unit}`}</div>
          </div>
        </Link>
      </div>
    );
  }

  render() {
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
      </section>
    );
  }
}

SummaryPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  params: PropTypes.shape({
    linodeId: PropTypes.string.isRequired,
  }).isRequired,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(SummaryPage);
