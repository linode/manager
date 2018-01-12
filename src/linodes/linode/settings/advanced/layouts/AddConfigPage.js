import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components';

import { setSource } from '~/actions/source';
import { CreateOrEditConfig } from '../components';
import { selectLinode } from '../../../utilities';


export class AddConfigPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    const { dispatch, kernels, linode, account } = this.props;
    const header = <CardHeader title="Add a Config" />;

    return (
      <div>
        <Card header={header}>
          <CreateOrEditConfig
            linode={linode}
            kernels={kernels}
            account={account}
            disks={linode._disks.disks}
            volumes={linode._volumes.volumes}
            dispatch={dispatch}
            submitText="Add Config"
            submitDisabledText="Adding Config"
          />
        </Card>
      </div>
    );
  }
}

AddConfigPage.propTypes = {
  linode: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired,
  kernels: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export function select(state, props) {
  const { linode } = selectLinode(state, props);
  const { kernels, account } = state.api;
  return { linode, kernels, account };
}

export default connect(select)(AddConfigPage);
