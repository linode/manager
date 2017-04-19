import React, { PropTypes } from 'react';


export default function PlanStyle(props) {
  const { plan } = props;

  if (!plan || !plan.label) {
    return null;
  }

  const planStr = plan.label.split(' ');
  return (
    <span>
      {`${planStr[0]} ${parseInt(planStr[1], 10) / 1024}G`}
    </span>
  );
}

PlanStyle.propTypes = {
  plan: PropTypes.object,
};
