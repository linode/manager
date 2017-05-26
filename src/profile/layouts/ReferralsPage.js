import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';

function ReferralsPage(props) {
  const { code, url, total, completed, pending, credit } = props.referrals;
  const ref = `You have ${total} total referrals: ${completed} completed
    ($${(credit).toFixed(2)}) and ${pending} pending`;
  const header =  <CardHeader title="Referrals" nav={ref} />

  return (
    <Card header={header}>
      <div className="row">
        <div className="col-sm-12">
          Referrals reward you when you refer people to Linode. If someone
          signs up using your referral code, you'll receive a credit of
          $20.00, so long as the person you referred remains an active
          customer for 90 days.
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <hr />
        </div>
      </div>
      <div className="row">
        <div className="col-sm-2 row-label">
          Referral Code
        </div>
        <div className="col-sm-10">
          {code}
        </div>
      </div>
      <div className="row">
        <div className="col-sm-2 row-label">
          Referral URL
        </div>
        <div className="col-sm-10">
          {url}
        </div>
      </div>
    </Card>
  );
}

function select(state) {
  return {
    referrals: state.api.profile.referrals,
  };
}

ReferralsPage.propTypes = {
  referrals: PropTypes.object,
};

export default connect(select)(ReferralsPage);

