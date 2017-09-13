import React, { PropTypes } from 'react';


export function planStyle(plan, withPrice = false) {
  if (!plan) {
    return 'Unknown';
  }

  const output = `Linode ${parseInt(plan.memory) / 1024}G`;
  return withPrice ? `${output} ($${plan.price_monthly.toFixed(2)}/mo)` : output;
}

export function planStats(plan) {
  const readable = planStyle(plan);
  if (!readable) {
    return null;
  }

  if (readable === 'Unknown') {
    return readable;
  }

  const ram = plan.memory / 1024;
  const storage = plan.disk / 1024;
  const vcpus = plan.vcpus;

  return `${readable}: ${vcpus} CPU(s), ${storage}G Storage, ${ram}G RAM`;
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
