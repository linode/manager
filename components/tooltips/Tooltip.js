import PropTypes from 'prop-types';
import React from 'react';
import ReactTooltip from 'react-tooltip';


export default function Tooltip(props) {
  const { id, position, children } = props;

  return (
    <ReactTooltip
      className="Tooltip"
      delayHide={500}
      delayShow={300}
      id={id}
      effect="solid"
      place={position}
      role="tooltip"
    >
      {children}
    </ReactTooltip>
  );
}

Tooltip.propTypes = {
  id: PropTypes.string,
  children: PropTypes.node,
  position: PropTypes.string,
};

Tooltip.defaultProps = {
  position: 'top', // top, right, bottom, left
};
