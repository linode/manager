import { range } from 'ramda';
import { cloneLinode as _cloneLinode, createLinode as _createLinode, CreateLinodeRequest as _CreateLinodeRequest, deleteLinode as _deleteLinode, getLinode as _getLinode, getLinodes as _getLinodes, LinodeCloneData, updateLinode as _updateLinode } from 'src/services/linodes';
import { createRequestThunk } from 'src/store/request/request.helpers';
import { RequestThunk } from 'src/store/types';
import { actionCreator } from './linodes.actions';

type Entity = Linode.Linode;

/**
 * Create
 */
export type CreateLinodeRequest = _CreateLinodeRequest;
export type CreateLinodeResponse = Entity;

export const createLinodeActions = actionCreator.async<CreateLinodeRequest, CreateLinodeResponse, Linode.ApiFieldError[]>(`create`);

export const createLinode = createRequestThunk(
  createLinodeActions,
  (data) => _createLinode(data),
);


/**
 * Get Linode
 */
export interface GetOneRequest { id: number };

export type GetOneResponse = Entity;

export const getLinodeActions = actionCreator.async<GetOneRequest, GetOneResponse, Linode.ApiFieldError[]>(`get-one`);

export const getLinode = createRequestThunk(
  getLinodeActions,
  ({ id }) => _getLinode(id).then((response) => response.data),
)

/**
 * Update Linode
 */
export type UpdateRequest = Partial<Entity> & { id: number };

export type UpdateResponse = Entity;

export const updateLinodeActions = actionCreator.async<UpdateRequest, UpdateResponse, Linode.ApiFieldError[]>('update');

export const updateLinode = createRequestThunk(
  updateLinodeActions,
  ({ id, ...rest }) => _updateLinode(id, rest)
)

/**
 * Delete Linode
 */
export interface DeleteRequest { id: number };

export const deleteLinodeActions = actionCreator.async<DeleteRequest, {}, Linode.ApiFieldError[]>(`delete`);

export const deleteLinode = createRequestThunk(deleteLinodeActions, ({ id }) => _deleteLinode(id));

/**
 * Get Linodes
 */
export interface GetPageRequest {
  page?: number;
  page_size?: number;
  filter?: any;
}

export type GetPageResponse = Linode.ResourcePage<Entity>;

export const getLinodesPageActions = actionCreator.async<GetPageRequest, GetPageResponse, Linode.ApiFieldError[]>(`get-page`);


export const getLinodesPage = createRequestThunk(
  getLinodesPageActions,
  ({ page, page_size, filter }) => _getLinodes({ page, page_size }, filter),
);

/**
 * Clone Linode
 */
export interface CloneRequest extends LinodeCloneData {
  id: number;
}

export type CloneResponse = Entity;

export const cloneLinodeActions = actionCreator.async<CloneRequest, CloneResponse, Linode.ApiFieldError[]>(`clone`);

export const clondeLinode = createRequestThunk(
  cloneLinodeActions,
  ({ id, ...rest }) => _cloneLinode(id, rest)
)

/**
 * Get all Linoes.
 */
export const getAllLinodesActions = actionCreator.async<void, Entity[], Linode.ApiFieldError[]>(`get-all`);

export const requestAllLinodes: RequestThunk<Linode.ResourcePage<Entity>> = (
  page: number = 1,
  prevData: Entity[] = [],
) => async (dispatch) => {
  dispatch(getAllLinodesActions.started());

  try {
    const { data, pages } = await dispatch(getLinodesPage({ page, page_size: 100 }));

    const mergedData = [...prevData, ...data];

    if (page === pages) {
      const doneAction = getAllLinodesActions.done({ result: mergedData });
      dispatch(doneAction);
      return mergedData;
    }

    if (page < pages) {
      const r = range(page + 1, pages + 1);

      const requests = r.map((nextPage) => dispatch(getLinodesPage({ page: nextPage, page_size: 100 })));

      const results = await Promise.all(requests);

      const doneAction = getAllLinodesActions.done({
        result: results.reduce((result, response) => [...result, ...response.data], data),
      });

      dispatch(doneAction);
      return mergedData;
    }

    return;

  } catch (error) {
    dispatch(getAllLinodesActions.failed({ error }));
    return error;
  }
};
