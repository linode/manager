import React from 'react';
import { PropTypes } from 'prop-types';
import { Link } from 'react-router';
import { API_VERSION, API_ROOT } from '~/constants';


export default function DescriptionCell(props) {
  const { column, record } = props;
  const { description, seeAlso } = record;
  const seeAlsoDisplay = seeAlso && (Array.isArray(seeAlso) ? seeAlso : [seeAlso]).map(item => (
    <div className="DescriptionCell-seeAlso">
      <small>See also: <Link to={`/${API_VERSION}${item}`}>{item}</Link></small>
    </div>
  ));

  let descriptionEl;
  if (typeof description === 'object') {
    descriptionEl = (
      <div>
        <div>{description.descText}
          <ul>
            {description.listItems.map(function(item) {
              return (<li>{item}</li>);
            })}
          </ul>
        </div>
        {seeAlsoDisplay}
      </div>
    );
  } else {
    descriptionEl = (
      <div>
        <div>{description}</div>
        {seeAlsoDisplay}
      </div>
    );
  }

  return (
    <td className={`Table-cell DescriptionCell`}>
      {descriptionEl}
    </td>
  );
}
