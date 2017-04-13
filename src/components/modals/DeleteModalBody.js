import React, { PropTypes } from 'react';
import ConfirmModalBody from '~/components/modals/ConfirmModalBody';
import ScrollingList from '~/components/ScrollingList';

export default function DeleteModalBody(props) {
  const {
    onOk,
    buttonText,
    items,
    onCancel,
    typeOfItem,
  } = props;

  let body;
  let newButtonText = buttonText;
  if (items.length > 1) {
    body = (
      <div>
        <p>Are you sure you want to <strong>permanently</strong> delete these {typeOfItem}?</p>
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
    newButtonText = buttonText.replace(/s$/, '');
  }

  return (
    <ConfirmModalBody
      className="DeleteModalBody"
      buttonText={newButtonText}
      onOk={onOk}
      onCancel={onCancel}
    >
      {body}
    </ConfirmModalBody>
  );
}

DeleteModalBody.propTypes = {
  onOk: PropTypes.func,
  buttonText: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.string),
  onCancel: PropTypes.func,
  typeOfItem: PropTypes.string,
};
