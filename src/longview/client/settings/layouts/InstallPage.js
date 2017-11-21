import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import {
  Input,
  FormGroup,
} from 'linode-components/forms';

import { setSource } from '~/actions/source';
import { selectLVClient } from '../../utilities';


export class InstallPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    const header = <CardHeader title="Install" />;
    const installCommand = `curl -s https://lv.linode.com/${this.props.lvclient.install_code} | sudo bash`;

    return (
      <Card header={header}>
        <FormGroup className="row">
          <label htmlFor="lvclient-api-key" className="col-sm-2 col-form-label">
            Longview API Key
          </label>
          <div className="col-sm-8 col-lg-4">
            <Input
              id="lvclient-api-key"
              value={this.props.lvclient.api_key}
              readOnly
            />
          </div>
        </FormGroup>
        <FormGroup className="row">
          <label htmlFor="lvclient-install" className="col-sm-2 col-form-label">Instructions</label>
          <div className="col-sm-8 col-lg-4">
            <Input
              id="lvclient-install"
              value={installCommand}
              readOnly
            />
          </div>
          <div className="col-sm-10 col-lg-4 text-muted text-right">
            Run this command to install the Longview Agent
          </div>
        </FormGroup>
      </Card>
    );
  }
}

InstallPage.propTypes = {
  lvclient: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(selectLVClient)(InstallPage);
