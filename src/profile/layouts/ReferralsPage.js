import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';

export function ReferralsPage(props) {
  const { code, url, total, completed, pending, credit } = props.referrals;
  const ref = `You have ${total} total referrals: ${completed} completed
    ($${(credit).toFixed(2)}) and ${pending} pending`;
  const header = <CardHeader title="Referrals" nav={ref} />;

  return (
    <Card header={header}>
      <p>
        Referrals reward you when you refer people to Linode. If someone
        signs up using your referral code, you'll receive a credit of
        $20.00, so long as the person you referred remains an active
        customer for 90 days.
      </p>
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

ReferralsPage.propTypes = {
  referrals: PropTypes.object,
};

function select(state) {
  return {
    referrals: state.api.profile.referrals,
  };
}

export default connect(select)(ReferralsPage);

