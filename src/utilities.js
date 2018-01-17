import React from 'react';
import { matchPath } from 'react-router-dom';
import isFunction from 'lodash/isFunction';
import capitalize from 'lodash/capitalize';

import { DeleteModalBody } from 'linode-components';

import { showModal as showModal_, hideModal as hideModal_ } from '~/actions/modal';
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

    dispatch(showModal_(title, (
      <DeleteModalBody
        onSubmit={function () {
          const ids = toDelete.map(o => o[idKey]);
          return dispatch(dispatchOrStoreErrors.call(this, [
            () => (dispatch) => Promise.all(ids.map(id => dispatch(deleteFunction(id)))),
            () => removeSelected(objectType, ids),
            hideModal_,
          ]));
        }}
        items={toDelete.map(labelFn)}
        typeOfItem={`${objectLabel}s`}
        onCancel={() => dispatch(hideModal_())}
        deleteAction={deleteAction}
        deleteActionPending={deleteActionPending}
        boldItems={false}
      />
    )));
  };
}

/* This must be bound to a Component that uses it */
export function hideModal() { this.setState({ modal: null }); }

export function deleteModalProps(
  dispatch, objects, deleteMethod, objectName, objectType, hideModal,
  labelKey = 'label', idKey = 'id') {
  const labels = objects.map(objects => objects[labelKey]);
  const ids = objects.map(objects => objects[idKey]);

  const callback = async () => {
    await dispatch((dispatch) => Promise.all(ids.map(id => dispatch(deleteMethod(id)))));
    await removeSelected(objectType, ids);
    hideModal();
  };

  const name = capitalize(objectName) + (ids.length > 1 ? 's' : '');
  const title = `Delete ${name}`;

  return {
    title: title,
    name: `massDelete${objectName}`,
    onSubmit: callback,
    onCancel: hideModal,
    items: labels,
    typeOfItem: name,
    deleteAction: 'delete',
    deleteActionPending: 'deleting',
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

