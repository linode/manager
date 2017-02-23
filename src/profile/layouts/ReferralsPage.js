import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card } from '~/components/cards';

function ReferralsPage(props) {
  // TODO: Add referrals description
  return (
    <Card title="Referrals">
      <div className="row">
        <div className="col-sm-2 row-label">
          Referral Code
        </div>
        <div className="col-sm-10">
          {props.code}
        </div>
      </div>
      <div className="row">
        <div className="col-sm-2 row-label">
          Referral URL
        </div>
        <div className="col-sm-10">
          {props.url}
        </div>
      </div>
    </Card>
  );
}

function select(state) {
  return {
    referrals: state.api.profile.profile.undefined.referrals,
  };
}

ReferralsPage.propTypes = {
  code: PropTypes.string,
  url: PropTypes.string,
};

export default connect(select)(ReferralsPage);

