import React from 'react';
import { matchPath } from 'react-router-dom';
import isFunction from 'lodash/isFunction';
import capitalize from 'lodash/capitalize';

import { DeleteModalBody } from 'linode-components';

import { showModal, hideModal } from '~/actions/modal';
import { removeSelected } from '~/actions/select';
import { dispatchOrStoreErrors } from '~/api/util';


export function confirmThenDelete(dispatch, objectLabel, deleteFunction, objectType,
  labelKey = 'label', deleteAction = 'delete',
  deleteActionPending = 'deleting', idKey = 'id') {
  return function (_toDelete) {
    const labelFn = isFunction(labelKey) ? labelKey : (o) => o[labelKey];
    const toDelete = Array.isArray(_toDelete) ? _toDelete : [_toDelete];

    let title = `Delete ${capitalize(objectLabel)}`;
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

export const isPathOneOf = (paths, pathname, props) => {
  return paths.reduce((result, path) => {
    return result || Boolean(matchPath(pathname, { ...props, path }));
  }, false);
};

export const getLinodeByLabel = (linodes, label) => {
  return Object.values(linodes)
    .find((linode) => linode.label === label);
};

