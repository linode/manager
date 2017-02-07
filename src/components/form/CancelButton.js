import React, { PropTypes } from 'react';

import { LinkButton } from '~/components/buttons';

export default function CancelButton(props) {
  return (
    <LinkButton
      disabled={props.disabled}
      onClick={props.onClick}
      to={props.to}
      className={props.className}
    >{props.children}</LinkButton>
  );
}

CancelButton.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  to: PropTypes.string,
  className: PropTypes.string.isRequired,
};

CancelButton.defaultProps = {
  children: 'Cancel',
  disabled: false,
  className: 'btn-cancel',
};
