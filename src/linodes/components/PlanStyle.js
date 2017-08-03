import React, { PropTypes } from 'react';


export function planStyle(plan, withPrice = false) {
  if (!plan || !plan.label) {
    return null;
  }

  const [name, number] = plan.label.split(' ');
  const output = `${name} ${parseInt(number, 10) / 1024}G`;
  return withPrice ? `${output} ($${plan.monthly_price.toFixed(2)}/mo)` : output;
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
