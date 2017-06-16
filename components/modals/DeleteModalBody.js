import React, { PropTypes } from 'react';
import ConfirmModalBody from './ConfirmModalBody';
import { ScrollingList } from '../lists';

export default function DeleteModalBody(props) {
  const {
    onOk,
    items,
    onCancel,
    typeOfItem,
    parentItem,
  } = props;

  let body;
  if (items.length > 1) {
    body = (
      <div>
        <p>
          Are you sure you want to <strong>permanently</strong> delete
          these {items.length} {typeOfItem}?
        </p>
        <ScrollingList items={items} />
        <p>This operation cannot be undone.</p>
      </div>
    );
  } else {
    body = (
      <p>
        Are you sure you want
        to <strong>permanently</strong> delete <strong>{items[0]}</strong>?
      </p>
    );
  }

  return (
    <ConfirmModalBody
      className="DeleteModalBody"
      buttonText="Delete"
      buttonDisabledText="Deleting"
      onOk={onOk}
      onCancel={onCancel}
    >
      {body}
    </ConfirmModalBody>
  );
}

DeleteModalBody.propTypes = {
  onOk: PropTypes.func,
  items: PropTypes.arrayOf(PropTypes.string),
  onCancel: PropTypes.func,
  typeOfItem: PropTypes.string,
};
