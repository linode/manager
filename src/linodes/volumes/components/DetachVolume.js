import React from 'react';

import { showModal, hideModal } from '~/actions/modal';
import { DeleteModalBody } from 'linode-components/modals';
import { detachVolume } from '~/api/volumes';


export function DetachVolume(dispatch, objectType) {
  return function (record) {
    dispatch(showModal('Detach Volume', (
      <DeleteModalBody
        onSubmit={async function() {
          await dispatch(detachVolume(record.id));
          dispatch(hideModal());
        }}
        items={[record.label]}
        typeOfItem={objectType}
        deleteAction="detach"
        onCancel={() => dispatch(hideModal())}
      />
    )));
  };
}
