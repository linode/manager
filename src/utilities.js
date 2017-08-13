import _ from 'lodash';
import React from 'react';

import { DeleteModalBody } from 'linode-components/modals';

import { showModal, hideModal } from '~/actions/modal';
import { default as toggleSelected } from '~/actions/select';


export function convertUnits(value, units, unitType, fixedNumber = 0) {
  return `${value.toFixed(fixedNumber) / Math.pow(1000, units)}${unitType[units]}/s`;
}

export function confirmThenDelete(dispatch, objectLabel, deleteFunction, objectType,
                                  labelKey = 'label', deleteAction = 'delete',
                                  deleteActionPending = 'deleting', idKey = 'id') {
  return function (_toDelete) {
    const labelFn = _.isFunction(labelKey) ? labelKey : (o) => o[labelKey];
    const toDelete = Array.isArray(_toDelete) ? _toDelete : [_toDelete];

    let title = `Delete ${_.capitalize(objectLabel)}`;
    if (toDelete.length > 1) {
      title += 's';
    }

    dispatch(showModal(title, (
      <DeleteModalBody
        onSubmit={async function() {
          const ids = toDelete.map(o => o[idKey]);
          await Promise.all(ids.map(id => dispatch(deleteFunction(id))));
          dispatch(toggleSelected(objectType, ids));
          dispatch(hideModal());
        }}
        items={toDelete.map(labelFn)}
        typeOfItem={`${objectLabel}s`}
        onCancel={() => dispatch(hideModal())}
        deleteAction={deleteAction}
        deleteActionPending={deleteActionPending}
      />
    )));
  };
}
