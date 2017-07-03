import React from 'react';
import { PropTypes } from 'prop-types';
import { Link } from 'react-router';
import { API_VERSION, API_ROOT } from '~/constants';


export default function DescriptionCell(props) {
  const { column, record } = props;
  const { description, seeAlso } = record;
  const seeAlsoDisplay = [];
  if (Array.isArray(seeAlso)) {
    seeAlso.forEach((seeAlsoItem) => {
      seeAlsoDisplay.push((<div>See also: <Link to={`/${API_VERSION}${seeAlsoItem}`}>{seeAlsoItem}</Link></div>));
    });
  } else {
    seeAlsoDisplay.push(!seeAlso ? null : (<div>See also: <Link to={`/${API_VERSION}${seeAlso}`}>{seeAlso}</Link></div>));
  }

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
        {seeAlsoDisplay.map( (item) => item )}
      </div>
    );
  } else {
    descriptionEl = (
      <div>
        <span>{description}</span>
        {seeAlsoDisplay.map( (item) => item )}
      </div>
    );
  }

  return (
    <td className={`Table-cell DescriptionCell`}>
      {descriptionEl}
    </td>
  );
}
