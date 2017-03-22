import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card } from '~/components/cards';

// eslint-disable-next-line react/prefer-stateless-function
export class DashboardPage extends Component {

  render() {
    return (
      <div className="BlankSlate">
        <div className="BlankSlate-body">
          <p className="text-muted text-sm-center BillingDashboard-placeholder">
            <span>Please use the </span>
            <a href="https://manager.linode.com/account" target="_blank">
              Classic Manager
            </a>
            <span> to view billing, update payment information, or make payments.</span>
          </p>
        </div>
      </div>
    );
  }
}

DashboardPage.propTypes = {
  dispatch: PropTypes.func,
};

function mapStateToProps() {
  return {};
}

export default connect(mapStateToProps)(DashboardPage);
