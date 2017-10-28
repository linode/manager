import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import FormModalBody from './FormModalBody';
import { ScrollingList } from '../lists';


export default function DeleteModalBody(props) {
  const {
    onSubmit,
    items,
    onCancel,
    typeOfItem,
    deleteAction,
    deleteActionPending,
  } = props;

  const groupedItems = _.groupBy(items);
  const groupedDOMItems = _.map(groupedItems, function (items, label) {
    if (items.length > 1) {
      return <span><strong>{label}</strong> (x{items.length})</span>;
    }

    return <strong>{label}</strong>;
  });

  let body;
  if (groupedDOMItems.length > 1) {
    body = (
      <div>
        <p>
          {/* eslint-disable max-len */}
          Are you sure you want to <strong>permanently</strong> {deleteAction} these {items.length} {typeOfItem}?
          {/* eslint-enable max-len */}
        </p>
        <ScrollingList items={groupedDOMItems} />
        <p>This operation cannot be undone.</p>
      </div>
    );
  } else {
    let domItem = groupedDOMItems[0];
    domItem = React.isValidElement(domItem) ? domItem : <strong>{domItem}</strong>;

    body = (
      <p>
        Are you sure you want
        to <strong>permanently</strong> {deleteAction} {domItem}?
      </p>
    );
  }

  const title = `Delete ${typeOfItem}`;
  const analytics = { title, action: 'delete' };

  return (
    <FormModalBody
      className="DeleteModalBody"
      buttonText={_.capitalize(deleteAction)}
      buttonDisabledText={_.capitalize(deleteActionPending)}
      onSubmit={onSubmit}
      onCancel={onCancel}
      analytics={analytics}
    >
      {body}
    </FormModalBody>
  );
}

DeleteModalBody.propTypes = {
  onSubmit: PropTypes.func,
  items: PropTypes.arrayOf(PropTypes.node),
  onCancel: PropTypes.func,
  typeOfItem: PropTypes.string.isRequired,
  deleteAction: PropTypes.string.isRequired,
  deleteActionPending: PropTypes.string.isRequired,
};

DeleteModalBody.defaultProps = {
  deleteAction: 'delete',
  deleteActionPending: 'deleting',
};
