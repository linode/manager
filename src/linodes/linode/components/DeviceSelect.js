import _ from 'lodash';
import React, { PropTypes } from 'react';

import { FormGroup, FormGroupError, Select } from 'linode-components/forms';


export default function DeviceSelect(props) {
  const {
    errors, labelClassName, fieldClassName, configuredDevices, disks, volumes, slot, noVolumes,
  } = props;

  const options = [
    { value: '', label: '-- None --' },
  ];

  const categories = [['disks', disks]];
  if (!noVolumes) {
    categories.push(['volumes', volumes]);
  }

  for (const [type, objects] of categories) {
    if (Object.values(objects).length) {
      options.push({ label: _.capitalize(type), options: [] });

      Object.values(objects).forEach(function (o) {
        if (!o) {
          return;
        }

        const valueKey = `${type.slice(0, -1)}_id`;
        options[options.length - 1].options.push({
          label: o.label,
          value: noVolumes ? o.id : JSON.stringify({ [valueKey]: o.id }),
        });
      });
    }
  }

  const configuredDevice = configuredDevices[slot];

  // This linter error is stupid...
  // eslint-disable-next-line react/prop-types
  const onChange = ({ target: { value } }) =>
    props.onChange({ target: { name: slot, value } });

  return (
    <FormGroup className="row" errors={errors} name={slot}>
      <label className={`${labelClassName} col-form-label`}>/dev/{slot}</label>
      <div className={fieldClassName}>
        <Select
          className="input-md"
          onChange={onChange}
          options={options}
          name={slot}
          value={configuredDevice}
        />
        <FormGroupError errors={errors} name={slot} />
      </div>
    </FormGroup>
  );
}

DeviceSelect.format = function (devices) {
  let formatted = devices;
  try {
    formatted = _.mapValues(devices, JSON.parse);
  } catch (e) {
    // Pass
  }

  return _.omitBy(formatted, d => !_.isInteger(d) && _.isEmpty(d));
};

DeviceSelect.propTypes = {
  errors: PropTypes.object.isRequired,
  labelClassName: PropTypes.string.isRequired,
  fieldClassName: PropTypes.string.isRequired,
  configuredDevices: PropTypes.object.isRequired,
  disks: PropTypes.object.isRequired,
  volumes: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  slot: PropTypes.string.isRequired,
  noVolumes: PropTypes.bool.isRequired,
};
