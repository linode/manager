import { range } from 'ramda';
import { createMeta } from 'src/store/request/request.helpers';
import { Action } from 'typescript-fsa';
import { actionCreator } from './linodes.actions';

/**
 * Create Linode
 */
export interface CreateRequest {
  type: string | null;
  region: string | null;
  stackscript_id?: number;
  backup_id?: number;
  swap_size?: number;
  image?: string | null;
  root_pass?: string | null;
  authorized_keys?: string[];
  backups_enabled?: boolean;
  stackscript_data?: any;
  booted?: boolean;
  label: string | null;
  tags?: string[];
  private_ip?: boolean;
  authorized_users?: string[];
}

export type CreateResponse = Linode.Linode;

export const createLinode = actionCreator.async<CreateRequest, CreateResponse, Linode.ApiFieldError[]>(`create`);

const createLinodeMeta = createMeta<CreateRequest>(createLinode, {
  endpoint: () => `/linode/instances`,
  method: 'POST',
});

export const requestCreateLinode = actionCreator<CreateRequest>(`request/create`, createLinodeMeta);



/**
 * Get Linode
 */
export interface GetOneRequest { id: number };

export type GetOneResponse = Linode.Linode;

export const getLinode = actionCreator.async<GetOneRequest, GetOneResponse, Linode.ApiFieldError[]>(`get-one`);

const getLinodeMeta = createMeta<GetOneRequest>(getLinode, {
  endpoint: ({ id }) => `/linode/instances/${id}`,
  method: 'GET',
});

export const requestGetOneLinode = actionCreator<GetOneRequest>(`request/get-one`, getLinodeMeta);



/**
 * Update Linode
 */
export interface UpdateRequest {
  id: number;
  label: string | null;
  tags?: string[];
  alerts: Linode.LinodeAlerts;
  backups: {
    schedule: Linode.LinodeBackupSchedule;
  };
  watchdog_enabled: boolean;
}

export type UpdateResponse = Linode.Linode;

export const updateLinode = actionCreator.async<UpdateRequest, UpdateResponse, Linode.ApiFieldError[]>(`update`);

const updateLinodeMeta = createMeta<UpdateRequest>(updateLinode, {
  endpoint: ({ id }) => `/linode/instances/${id}`,
  method: 'PUT',
});

export const requestUpdateLinode = actionCreator<UpdateRequest>(`request/update`, updateLinodeMeta);



/**
 * Delete Linode
 */
export interface DeleteRequest { id: number };

export type DeleteResponse = DeleteRequest;

export const deleteLinode = actionCreator.async<DeleteRequest, DeleteResponse, Linode.ApiFieldError[]>(`delete`);

const deleteLinodeMeta = createMeta(deleteLinode, {
  endpoint: ({ id }) => `/linode/instances/${id}`,
  method: 'DELETE',
});

export const requestDeleteLinode = actionCreator<DeleteRequest>(`request/delete`, deleteLinodeMeta);



/**
 * Get Linodes
 */
export interface GetPageRequest {
  page?: number;
  page_size?: number;
  filter?: any;
}

export type GetPageResponse = Linode.ResourcePage<Linode.Linode>;

export const getLinodesPage = actionCreator.async<GetPageRequest, GetPageResponse, Linode.ApiFieldError[]>(`get-page`);

const getLinodesPageMeta = createMeta(getLinodesPage, {
  endpoint: () => `/linode/instances`,
  method: 'GET',
});

export const requestGetLinodesPage = actionCreator<GetPageRequest>(`request/get-page`, getLinodesPageMeta);



/**
 * Clone Linode
 */
export interface CloneRequest {
  id: number;
  linode_id?: string;
  region?: string | null;
  type?: string | null;
  label?: string | null;
  backups_enabled?: boolean | null;
  tags?: string[] | null;
}

export type CloneResponse = Linode.Linode;

export const cloneLinode = actionCreator.async<CloneRequest, CloneResponse, Linode.ApiFieldError[]>(`clone`);

const cloneLinodeMeta = createMeta(cloneLinode, {
  endpoint: ({ id }) => `/linode/instances/${id}/clone`,
  method: 'POST',
});

export const requestCloneLinode = actionCreator<CloneRequest>(`request/clone`, cloneLinodeMeta);

/**
 * Get all Linoes.
 */

export const getAllLinodes = actionCreator.async<void, Linode.Linode[], Linode.ApiFieldError[]>(`get-all`);

export const requestAllLinodes = (
  page: number = 1,
  prevData: Linode.Linode[] = [],
) => async (dispatch: (action: Action<any>) => Promise<Linode.ResourcePage<Linode.Linode>>) => {
  dispatch(getAllLinodes.started());

  try {
    const requestAction = requestGetLinodesPage({ page, page_size: 100 });
    const { data, pages } = await dispatch(requestAction);

    const mergedData = [...prevData, ...data];

    if (page === pages) {
      const doneAction = getAllLinodes.done({ result: mergedData });
      return dispatch(doneAction);
    }

    if (page < pages) {
      const r = range(page + 1, pages + 1);
      const requests = r.map((nextPage) => dispatch(requestGetLinodesPage({ page: nextPage, page_size: 100 })));

      const results = await Promise.all(requests);

      const doneAction = getAllLinodes.done({
        result: results.reduce((result, response) => [...result, ...response.data], data),
      });

      return dispatch(doneAction);
    }

    return;

  } catch (error) {
    return dispatch(getAllLinodes.failed({ error }));
  }
};
