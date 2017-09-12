import React, { PropTypes } from 'react';

import { Card, CardHeader } from 'linode-components/cards';


export default function TransferPool(props) {
  const { transfer: { used, quota } } = props;

  return (
    <Card
      header={<CardHeader title="This Month's Network Transfer Pool" />}
      className="TransferPool offset-md-3 col-md-6 text-center"
    >
      <div className="TransferPool-gauge">
        <div
          className="TransferPool-bar"
          style={{ width: `${Math.ceil(used / quota)}%` }}
        >
        </div>
      </div>
      <div>
        {used}GB Used, {quota - used}GB Remaining, {quota}GB Quota
      </div>
      <small className="text-muted">Your transfer is prorated and will reset next month</small>
    </Card>
  );
}

TransferPool.propTypes = {
  transfer: PropTypes.object.isRequired,
};
