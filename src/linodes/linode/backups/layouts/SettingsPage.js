import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';

import { setSource } from '~/actions/source';

import { CancelForm, ScheduleForm } from '../components';
import { selectLinode } from '../../utilities';


export class SettingsPage extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    const { dispatch, linode } = this.props;
    const { backups: { schedule: { day, window } } } = linode;

    return (
      <div>
        <Card header={<CardHeader title="Manage Schedule" />}>
          <ScheduleForm day={day} window={window} dispatch={dispatch} />
        </Card>
        <Card header={<CardHeader title="Cancel Backups Service" />}>
          <CancelForm linode={linode} dispatch={dispatch} />
        </Card>
      </div>
    );
  }
}

SettingsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
};

export default connect(selectLinode)(SettingsPage);
