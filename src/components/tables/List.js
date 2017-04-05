import React, { PropTypes } from 'react';


export default function List(props) {
  const { children, className, id } = props;

  return (
    <div id={id} className={`List ${className}`}>
      {children}
    </div>
  );
}

List.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  dispatch: PropTypes.func,
  id: PropTypes.string,
};

List.defaultProps = {
  className: '',
};
