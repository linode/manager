import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';

export default function Breadcrumbs(props) {
  const { crumbs } = props;

  return (
    <div className="Breadcrumbs">
      <ul>
        {crumbs.map(function ({ groupLabel, label, to }, index) {
          return (
            <li key={`${label}-${index}`} className="Breadcrumbs-crumb">
              <div>
                {groupLabel ? <div><small>{groupLabel}</small></div> : null}
                <div className="Breadcrumbs-crumbLink">
                  <Link to={to}>{label}</Link>
                </div>
              </div>
              <div className="Breadcrumbs-divider">
                {index < (crumbs.length - 1) ? <i className="fa fa-chevron-right"></i> : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

Breadcrumbs.propTypes = {
  crumbs: PropTypes.arrayOf(PropTypes.object),
};
