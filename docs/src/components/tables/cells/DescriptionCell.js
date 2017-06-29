import React from 'react';
import { PropTypes } from 'prop-types';


export default function DescriptionCell(props) {
  const { column, record } = props;
  const { description } = record;

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
      </div>
    );
  } else {
    descriptionEl = (<span>{description}</span>);
  }

  return (
    <td className={`Table-cell DescriptionCell`}>
      {descriptionEl}
    </td>
  );
}
