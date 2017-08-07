import React, { PropTypes } from 'react';

import { ExternalLink } from 'linode-components/buttons';
import { Checkbox } from 'linode-components/forms';


export default function BackupsCheckbox(props) {
  let label = 'Enable';
  if (props.plan) {
    const backupsPrice = props.plans[props.plan].backups_price.toFixed(2);
    label = `Enable ($${backupsPrice}/mo)`;
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
