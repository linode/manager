import omit from 'lodash/omit';
import map from 'lodash/map';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import PropTypes from 'prop-types';
import React from 'react';

import { ExternalLink } from 'linode-components';
import { Select } from 'linode-components';

import { planStyle } from './PlanStyle';


export default function PlanSelect(props) {
  const sortedPlans = map(sortBy(props.plans, 'memory'), (plan) =>
    ({ label: planStyle(plan, true), value: plan.id, class: plan.class }));
  const groupedPlans = groupBy(sortedPlans, 'class');

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
  ...omit(Select.propTypes, 'options'),
  plans: PropTypes.object.isRequired,
};
