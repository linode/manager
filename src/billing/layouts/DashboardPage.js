import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Button } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';
import { FormGroup, Input } from 'linode-components/forms';

import { setSource } from '~/actions/source';
import { getObjectByLabelLazily } from '~/api/util';


export class DashboardPage extends Component {
  static async preload({ dispatch, getState }) {
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    await dispatch(setSource(__filename));
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-12">
            Test
          </div>
        </div>
      </div>
    );
  }
}

DashboardPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

function select(state, props) {
  return { };
}

export default connect(select)(DashboardPage);
