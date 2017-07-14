import _ from 'lodash';
import React, { PropTypes } from 'react';

import ConfirmModalBody from './ConfirmModalBody';
import { ScrollingList } from '../lists';
import { EmitEvent } from '../utils';


export default function DeleteModalBody(props) {
  const {
    onOk,
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
          Are you sure you want to <strong>permanently</strong> {deleteAction}
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
        to <strong>permanently</strong> {deleteAction} <strong>{items[0]}</strong>?
      </p>
    );
  }

  return (
    <ConfirmModalBody
      className="DeleteModalBody"
      buttonText={_.capitalize(deleteAction)}
      buttonDisabledText={_.capitalize(deleteActionPending)}
      onOk={() => {
        onOk();
        EmitEvent('modal:submit', 'Modal', 'delete', typeOfItem);
      }}
      onCancel={() => {
        onCancel();
        EmitEvent('modal:cancel', 'Modal', 'cancel', typeOfItem);
      }}
    >
      {body}
    </ConfirmModalBody>
  );
}

DeleteModalBody.propTypes = {
  onOk: PropTypes.func,
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
