import PropTypes from 'prop-types';
import React from 'react';

import { Dropdown } from '../dropdowns';


export default function PrimaryButton(props) {
  const groups = [
    { elements: [{ name: props.children, action: props.onClick, to: props.to, icon: 'fa-plus' }] },
  ];

  if (props.options && props.options.length) {
    groups.push({ elements: props.options });
  }

  return (
    <div className={`PrimaryButton ${props.className} ${props.buttonClass}`}>
      {/* TODO: add appropriate analytics items */}
      <Dropdown groups={groups} />
    </div>
  );
}

PrimaryButton.propTypes = {
  children: PropTypes.node.isRequired,
  options: PropTypes.array,
  onClick: PropTypes.func,
  to: PropTypes.string,
  buttonClass: PropTypes.string,
  className: PropTypes.string,
};

PrimaryButton.defaultProps = {
  buttonClass: 'btn-primary',
  className: '',
  options: [],
};
