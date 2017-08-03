import React, { PropTypes } from 'react';

import { FormGroup, FormGroupError, Select } from 'linode-components/forms';


export default function DiskSelect(props) {
  const { errors, labelClassName, fieldClassName, configuredDisks, disks, slot } = props;

  const noOption = { value: '', label: '-- None --' };
  const diskOptions = Object.values(disks).map(disk => !disk ? null : ({
    label: disk.label,
    value: disk.id,
  })).filter(Boolean);
  const allDiskOptions = [noOption, ...diskOptions];

  const configuredDisk = configuredDisks[slot];

  const onChange = ({ target: { value } }) =>
    props.onChange({ target: { name: slot, value: { disk_id: +value || null } } })

  return (
    <FormGroup className="row" errors={errors} name={slot}>
      <label className={`${labelClassName} col-form-label`}>/dev/{slot}</label>
      <div className={fieldClassName}>
        <Select
          className="input-md"
          onChange={onChange}
          options={allDiskOptions}
          name={slot}
          value={configuredDisk ? configuredDisk.disk_id : null}
        />
        <FormGroupError errors={errors} name={slot} />
      </div>
    </FormGroup>
  );
}

DiskSelect.propTypes = {
  errors: PropTypes.object.isRequired,
  labelClassName: PropTypes.string.isRequired,
  fieldClassName: PropTypes.string.isRequired,
  configuredDisks: PropTypes.object.isRequired,
  disks: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  slot: PropTypes.string.isRequired,
};
