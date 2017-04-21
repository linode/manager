import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export default function Breadcrumbs(props) {
  const { crumbs } = props;

  return (
    <div className="Breadcrumbs">
      <ul className="list-unstyled">
        {crumbs.map(function ({ groupLabel, label, to }) {
          return (
            <li key={label}>
              {groupLabel ? <div><small>{groupLabel}</small></div> : null}
              <div className="Breadcrumbs-crumb">
                <Link to={to}>{label}</Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
