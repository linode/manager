import _ from 'lodash';
import React, { PropTypes } from 'react';

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

  let body;
  if (items.length > 1) {
    body = (
      <div>
        <p>
          {/* eslint-disable max-len */}
          Are you sure you want to <strong>permanently</strong> {deleteAction} these {items.length} {typeOfItem}?
          {/* eslint-enable max-len */}
        </p>
        <ScrollingList items={items} />
        <p>This operation cannot be undone.</p>
      </div>
    );
  } else {
    body = (
      <p>
        Are you sure you want
        to <strong>permanently</strong> {deleteAction} <strong>{items[0]}</strong>?
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
  items: PropTypes.arrayOf(PropTypes.string),
  onCancel: PropTypes.func,
  typeOfItem: PropTypes.string.isRequired,
  deleteAction: PropTypes.string.isRequired,
  deleteActionPending: PropTypes.string.isRequired,
};

DeleteModalBody.defaultProps = {
  deleteAction: 'delete',
  deleteActionPending: 'deleting',
};
