import _ from 'lodash';
import React, { PropTypes } from 'react';

import { Select } from 'linode-components/forms';


export default function PlanSelect(props) {
  const sortedPlans = _.sortBy(_.map(props.plans, (plan) => ({ ...plan, value: plan.id })), 'value');
  const groupedPlans = _.groupBy(sortedPlans, 'class');

  const options = [
    { label: 'Standard', options: [...groupedPlans.nanode, ...groupedPlans.standard] },
    { label: 'High Memory', options: groupedPlans.highmem }
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
