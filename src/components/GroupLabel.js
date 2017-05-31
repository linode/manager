import React, { PropTypes } from 'react';

export default function GroupLabel(props) {
  if (props.object.group) {
    return (
      <span>
        <span className="text-muted">{props.object.group}{" / "}</span>
        <strong>{props.object.label}</strong>
      </span>
    );
  }

  return <strong>{props.object.label}</strong>;
}

GroupLabel.propTypes = {
  object: PropTypes.shape({
    label: PropTypes.string.isRequired,
    group: PropTypes.string,
  }),
};
