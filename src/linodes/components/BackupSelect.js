import _ from 'lodash';
import React, { PropTypes } from 'react';

import { Select } from 'linode-components/forms';


export default function BackupSelect(props) {
  const { daily, weekly, snapshot } = props.backups;

  const options = [{ label: 'Pick a Linode', value: 0 }];

  if (daily) {
    options[0] = { label: 'Daily', options: [{ label: daily.id, value: daily.id }] };
  }

  if (weekly) {
    options.push({ label: 'Weekly', options: weekly.map(w => ({ label: w.id, value: w.id })) });
  }

  if (snapshot && snapshot.current) {
    const { current } = snapshot;
    const option = {
      label: 'Snapshot',
      options: [{ label: current.label || current.id, value: current.id }],
    };

    if (!daily) {
      options[0] = option;
      options[0].value = option.options;
      delete options[0].options;
    } else {
      options.push(option);
    }
  }

  return (
    <Select
      {...props}
      options={options}
    />
  );
}

BackupSelect.propTypes = {
  ...Select.propTypes,
  backups: PropTypes.object,
};

BackupSelect.defaultProps = {
  backups: {},
};
