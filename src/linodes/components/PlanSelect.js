import _ from 'lodash';
import React, { PropTypes } from 'react';

import { ExternalLink } from 'linode-components/buttons';
import { Select } from 'linode-components/forms';

import { planStyle } from './PlanStyle';


export default function PlanSelect(props) {
  const sortedPlans = _.map(_.sortBy(props.plans, 'memory'), (plan) =>
    ({ label: planStyle(plan, true), value: plan.id, class: plan.class }));
  const groupedPlans = _.groupBy(sortedPlans, 'class');

  const options = [
    { label: 'Standard', options: [...groupedPlans.nanode, ...groupedPlans.standard] },
    { label: 'High Memory', options: groupedPlans.highmem },
  ];

  return (
    <div>
      <Select
        {...props}
        options={options}
      />
      <div>
        <small>
          <ExternalLink to="https://linode.com/pricing">Learn more</ExternalLink>
        </small>
      </div>
    </div>
  );
}

PlanSelect.propTypes = {
  ..._.omit(Select.propTypes, 'options'),
  plans: PropTypes.object.isRequired,
};
