import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card } from '~/components/cards';

// eslint-disable-next-line react/prefer-stateless-function
export class DashboardPage extends Component {

  render() {
    return (
      <div>
        <Card className="BillingDashboard" title="">
          <p className="text-muted text-sm-center BillingDashboard-placeholder">
            <span>Please use the </span>
            <a href="https://manager.linode.com/account" target="_blank">
              Classic Manager
            </a>
            <span> to view billing, update payment information, or make payments.</span>
          </p>
        </Card>
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
