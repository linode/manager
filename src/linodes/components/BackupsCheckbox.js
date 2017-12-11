import PropTypes from 'prop-types';
import React from 'react';

import { ExternalLink } from 'linode-components/buttons';
import { Checkbox } from 'linode-components/forms';
import { formatCurrency } from '~/components/Currency';


export default function BackupsCheckbox(props) {
  let label = 'Enable';
  if (props.plan) {
    const backupsPrice = props.plans[props.plan].addons.backups.price.monthly;
    label = `Enable (${formatCurrency(backupsPrice)}/mo)`;
  }

  return (
    <div>
      <Checkbox
        label={label}
        {...props}
      />
      <div>
        <small>
          <ExternalLink to="https://www.linode.com/backups">Learn more</ExternalLink>
        </small>
      </div>
    </div>
  );
}

BackupsCheckbox.propTypes = {
  plans: PropTypes.object.isRequired,
  plan: PropTypes.any,
  value: PropTypes.any.isRequired,
};
