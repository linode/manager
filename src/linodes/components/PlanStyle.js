import PropTypes from 'prop-types';
import React from 'react';
import DisplayCurrency from '~/components/DisplayCurrency';


export function planName(plan) {
  if (!plan) {
    return 'Unknown';
  }
  return `Linode ${parseInt(plan.memory) / 1024}G`;
}

export function priceInfo(price) {
  return <span>(<DisplayCurrency value={price} />)/mo</span>;
}

export function planStyle(plan, withPrice = false) {
  return <span>{planName(plan)} {withPrice && priceInfo(plan.price.monthly)}</span>;  
}

export function planStats(plan) {
  const readable = planName(plan);
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
