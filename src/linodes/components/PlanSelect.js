import _ from 'lodash';
import React, { PropTypes } from 'react';

import { Select } from 'linode-components/forms';

import { planStyle } from './PlanStyle';


export default function PlanSelect(props) {
  const sortedPlans = _.map(_.sortBy(props.plans, 'memory'), (plan) =>
    ({ label: planStyle(plan, true), value: plan.id, class: plan.class }));
  const groupedPlans = _.groupBy(sortedPlans, 'class');

  console.log(groupedPlans);
  const options = [
    { label: 'Standard', options: [...groupedPlans.nanode, ...groupedPlans.standard] },
    { label: 'High Memory', options: groupedPlans.highmem },
  ];

  return (
    <Select
      {...props}
      options={options}
    />
  );
}

PlanSelect.propTypes = {
  ...Select.propTypes,
  plans: PropTypes.object.isRequired,
};
