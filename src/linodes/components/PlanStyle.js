import React, { PropTypes } from 'react';


export function planStyle(plan) {
  if (!plan || !plan.label) {
    return null;
  }

  const planStr = plan.label.split(' ');
  return `${planStr[0]} ${parseInt(planStr[1], 10) / 1024}G`;
}

export default function PlanStyle(props) {
  const { plan } = props;

  return (
    <span>{planStyle(plan)}</span>
  );
}

PlanStyle.propTypes = {
  plan: PropTypes.object,
};
