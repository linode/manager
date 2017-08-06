import React, { PropTypes } from 'react';

import { Checkbox } from 'linode-components/forms';


export default function BackupsCheckbox(props) {
  let label = 'Enable';
  if (props.plan) {
    const backupsPrice = props.plans[props.plan].backups_price.toFixed(2);
    label = `Enable ($${backupsPrice}/mo)`;
  }

  return (
    <Checkbox
      label={label}
      checked={props.value}
      {...props}
    />
  );
}

BackupsCheckbox.propTypes = {
  plans: PropTypes.object.isRequired,
  plan: PropTypes.any,
  value: PropTypes.any.isRequired,
};
