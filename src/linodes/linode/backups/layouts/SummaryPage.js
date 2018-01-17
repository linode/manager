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
import { PortalModal } from '~/components/modal';
import { hideModal } from '~/utilities';

import { TakeSnapshot } from '../components';
import { selectLinode } from '../../utilities';


export class SummaryPage extends Component {
  constructor() {
    super();

    this.state = {
      errors: {},
      loading: false,
      modal: null,
    };

    this.hideModal = hideModal.bind(this);
  }

  takeSnapshotModal = (linode) => {
    this.setState({
      modal: {
        title: TakeSnapshot.title,
        name: 'takeSnapshot',
        linode: linode,
      },
    });
  }

  renderModal = () => {
    const { dispatch } = this.props;
    const { modal } = this.state;
    if (!modal) {
      return null;
    }
    const { name, title, linode } = modal;
    return (
      <PortalModal
        title={title}
        onClose={this.hideModal}
      >
        {(name === 'takeSnapshot') &&
          <TakeSnapshot
            dispatch={dispatch}
            linode={linode}
            close={this.hideModal}
          />
        }
      </PortalModal>
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
    const { linode } = this.props;
    const { loading, errors } = this.state;

    return (
      <Form
        onSubmit={() => this.takeSnapshotModal(linode)}
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
        {this.renderModal()}
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
