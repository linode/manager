import React, { PropTypes } from 'react';


export function planName(label) {
  const planStr = label.split(' ');
  return `${planStr[0]} ${parseInt(planStr[1], 10) / 1024}G`;
}

export default function PlanStyle(props) {
  const { plan } = props;

  if (!plan || !plan.label) {
    return null;
  }

  return (
    <span>
      {`${planName(plan.label)}`}
    </span>
  );
}

PlanStyle.propTypes = {
  plan: PropTypes.object,
};
