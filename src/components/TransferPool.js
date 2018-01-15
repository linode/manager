import PropTypes from 'prop-types';
import React from 'react';

import Card from 'linode-components/dist/cards/Card';
import CardHeader from 'linode-components/dist/cards/CardHeader';


export default function TransferPool(props) {
  if (! props.transfer) return <span />;
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
