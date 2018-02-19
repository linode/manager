import React from 'react';
import { matchPath } from 'react-router-dom';
import isFunction from 'lodash/isFunction';
import capitalize from 'lodash/capitalize';

import DeleteModalBody from 'linode-components/dist/modals/DeleteModalBody';

import { showModal as showModal_, hideModal as hideModal_ } from '~/actions/modal';
import { removeSelected } from '~/actions/select';
import { dispatchOrStoreErrors } from '~/api/util';

/**
 * @typedef {Object} Deleteable
 * @prop {string|number} [id]
 * @prop {string} [label]
 */
/**
 * @param {Function} dispatch
 * @param {string|number} objectLabel
 * @param {Function} deleteFunction
 * @param {string} objectType
 * @param {string|number} [labelKey=label]
 * @param {string} [deleteAction=delete]
 * @param {string} [deleteActionPending=deleting]
 * @param {string|number} [idKey=id]
 * @returns {function(Deleteable|Array<Deleteable>): void}
 */
export function confirmThenDelete(
  dispatch,
  objectLabel,
  deleteFunction,
  objectType,
  labelKey = 'label',
  deleteAction = 'delete',
  deleteActionPending = 'deleting',
  idKey = 'id'
) {
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

/**
 *
 * @param {Function} dispatch
 * @param {Array<Object>} objects
 * @param {Function} deleteMethod
 * @param {string} objectName
 * @param {string} objectType
 * @param {Function} hideModal
 * @param {string|number} [labelKey='label']
 * @param {string|number} [idKey='id']
 * @returns {Object}
 */
export function deleteModalProps(
  dispatch,
  objects,
  deleteMethod,
  objectName,
  objectType,
  hideModal,
  labelKey = 'label',
  idKey = 'id'
) {
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

/**
 *
 * @param {Array<string>} paths Haystack.
 * @param {string} pathname Needle.
 * @param {Object} [props] matchPath arguments.
 * @return {Boolean}
 */
export const isPathOneOf = (paths, pathname, props) => {
  return paths.reduce((result, path) => {
    return result || Boolean(matchPath(pathname, { ...props, path }));
  }, false);
};
/**
 *
 * @param {Array<Object>} linodes
 * @param {string} label
 * @returns {Object|undefined}
 */
export const getLinodeByLabel = (linodes, label) => {
  return Object.values(linodes)
    .find((linode) => linode.label === label);
};

