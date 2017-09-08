import React, { PropTypes } from 'react';

import { Card } from 'linode-components/cards';


export default function TransferPool(props) {
  const { transfer: { used, quota } } = props;

  return (
    <Card
      header={<h3 className="sub-header">This Month's Network Transfer Pool</h3>}
      className="transfer col-lg-6 col-md-12 col-sm-12"
    >
      <div className="TransferGauge">
        <div
          className="TransferGauge-bar"
          style={{ width: `${Math.ceil(used / quota)}%` }}
        >
        </div>
      </div>
      <div>
        {used}GB Used,
        {quota - used}GB Remaining,
        {quota}GB Quota
      </div>
      <small className="text-muted">Your transfer is prorated and will reset next month</small>
    </Card>
  );
}

TransferPool.propTypes = {
  transfer: PropTypes.object.isRequired,
};
