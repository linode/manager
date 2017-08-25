import React, { PropTypes } from 'react';


export function planStyle(plan, withPrice = false) {
  if (!plan || !plan.label) {
    return null;
  }

  const [name, number] = plan.label.split(' ');
  const output = `${name} ${parseInt(number) / 1024}G`;
  return withPrice ? `${output} ($${plan.monthly_price.toFixed(2)}/mo)` : output;
}

export function planStats(plan) {
  const readable = planStyle(plan);
  if (!readable) {
    return null;
  }

  const ram = plan.ram / 1024;
  const storage = plan.storage / 1024;
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
