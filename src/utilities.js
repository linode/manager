import _ from 'lodash';
import React from 'react';

import { DeleteModalBody } from 'linode-components/modals';

import { showModal, hideModal } from '~/actions/modal';
import { removeSelected } from '~/actions/select';
import { dispatchOrStoreErrors } from '~/api/util';


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
        onSubmit={function () {
          const ids = toDelete.map(o => o[idKey]);
          return dispatch(dispatchOrStoreErrors.call(this, [
            () => (dispatch) => Promise.all(ids.map(id => dispatch(deleteFunction(id)))),
            () => removeSelected(objectType, ids),
            hideModal,
          ]));
        }}
        items={toDelete.map(labelFn)}
        typeOfItem={`${objectLabel}s`}
        onCancel={() => dispatch(hideModal())}
        deleteAction={deleteAction}
        deleteActionPending={deleteActionPending}
        boldItems={false}
      />
    )));
  };
}
