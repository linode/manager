import React, { PropTypes } from 'react';
import ConfirmModalBody from '~/components/modals/ConfirmModalBody';
import ScrollingList from '~/components/ScrollingList';

export default function DeleteModalBody(props) {
  const {
    onOk,
    buttonText,
    items,
    selectedItems,
    onCancel,
    typeOfItem,
    label,
  } = props;
  let sentence;
  let newButtonText = buttonText;
  if (selectedItems.length > 1) {
    sentence = (<div>
      <p>Are you sure you want to <strong>permanently</strong> delete these {typeOfItem}?</p>
      <ScrollingList
        items={selectedItems.map(selectedItem => items[selectedItem][label])}
      />
      <p>This operation cannot be undone.</p>
    </div>);
  } else {
    sentence = (<p>
      Are you sure you want
      to <strong>permanently</strong> delete <strong>{items[selectedItems][label]}</strong>?
    </p>);
    newButtonText = buttonText.replace(/s$/, '');
  }

  return (
    <ConfirmModalBody
      className="DeleteModalBody"
      buttonText={newButtonText}
      onOk={onOk}
      onCancel={onCancel}
    >
      {sentence}
    </ConfirmModalBody>
  );
}

DeleteModalBody.propTypes = {
  onOk: PropTypes.func,
  buttonText: PropTypes.string,
  items: PropTypes.object,
  selectedItems: PropTypes.array,
  onCancel: PropTypes.func,
  typeOfItem: PropTypes.string,
  label: PropTypes.string,
};
