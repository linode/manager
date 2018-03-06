import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import Card from 'linode-components/dist/cards/Card';
import CardHeader from 'linode-components/dist/cards/CardHeader';

import { setSource } from '~/actions/source';
import { CreateOrEditConfig } from '../components';
import { selectLinode } from '../../../utilities';


export class EditConfigPage extends Component {
  componentDidMount() {
    const { dispatch, linode, config } = this.props;
    dispatch(setSource(__filename));

    if (!config) {
      dispatch(push(`/linodes/${linode.label}/settings/advanced`));
    }
  }

  render() {
    const { dispatch, config, kernels, linode, disks, volumes, account, type } = this.props;
    const header = <CardHeader title="Edit Config" />;

    return !config ? null : (
      <Card header={header}>
        <CreateOrEditConfig
          linode={linode}
          type={type}
          config={config}
          kernels={kernels}
          account={account}
          disks={disks}
          volumes={volumes}
          dispatch={dispatch}
        />
      </Card>
    );
  }
}

EditConfigPage.propTypes = {
  linode: PropTypes.object.isRequired,
  type: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired,
  kernels: PropTypes.object.isRequired,
  disks: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  volumes: PropTypes.object.isRequired,
};

export function select(state, props) {
  const { linode } = selectLinode(state, props);
  const type = state.api.types.types[linode.type];
  const { disks } = linode._disks;
  const { volumes } = linode._volumes;
  const config = linode._configs.configs[props.match.params.configId];
  const { kernels, account } = state.api;
  return { linode, type, config, kernels, account, disks, volumes };
}

export default connect(select)(EditConfigPage);
