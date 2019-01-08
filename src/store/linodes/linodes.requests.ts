import { range } from 'ramda';
import { requestActionCreatorFactory } from 'src/store/request/request.helpers';
import { Action } from 'typescript-fsa';
import { actionCreator } from './linodes.actions';

type Entity = Linode.Linode;

/** Create */
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

export type CreateResponse = Entity;

export const createLinode = requestActionCreatorFactory<CreateRequest, CreateResponse, Linode.ApiFieldError[]>(
  `linode`,
  `create`,
  { endpoint: () => `/linode/instances`, method: 'POST' },
);

/**
 * Get Linode
 */
export interface GetOneRequest { id: number };

export type GetOneResponse = Entity;

export const getLinode = requestActionCreatorFactory<GetOneRequest, GetOneResponse, Linode.ApiFieldError[]>(
  `linode`,
  `get-one`,
  { endpoint: ({ id }) => `/linode/instances/${id}`, method: 'GET' },
);

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

export type UpdateResponse = Entity;

export const updateLinode = requestActionCreatorFactory<UpdateRequest, UpdateResponse, Linode.ApiFieldError[]>(
  'linode',
  'update',
  { endpoint: ({ id }) => `/linode/instances/${id}`, method: 'PUT' },
);

/**
 * Delete Linode
 */
export interface DeleteRequest { id: number };

export type DeleteResponse = DeleteRequest;

export const deleteLinode = requestActionCreatorFactory<DeleteRequest, DeleteResponse, Linode.ApiFieldError[]>(
  `linode`,
  `delete`,
  { endpoint: ({ id }) => `/linode/instances/${id}`, method: 'DELETE' },
);

/**
 * Get Linodes
 */
export interface GetPageRequest {
  page?: number;
  page_size?: number;
  filter?: any;
}

export type GetPageResponse = Linode.ResourcePage<Entity>;

export const getLinodesPage = requestActionCreatorFactory<GetPageRequest, GetPageResponse, Linode.ApiFieldError[]>(
  `linode`,
  `get-page`,
  { endpoint: () => `/linode/instances`, method: 'GET' },
);

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

export type CloneResponse = Entity;

export const cloneLinode = requestActionCreatorFactory<CloneRequest, CloneResponse, Linode.ApiFieldError[]>(
  `linode`,
  `clone`,
  { endpoint: ({ id }) => `/linode/instances/${id}/clone`, method: 'POST' },
);

/**
 * Get all Linoes.
 */
export const getAllLinodes = actionCreator.async<void, Entity[], Linode.ApiFieldError[]>(`get-all`);

export const requestAllLinodes = (
  page: number = 1,
  prevData: Entity[] = [],
) => async (dispatch: (action: Action<any>) => Promise<Linode.ResourcePage<Entity>>) => {
  dispatch(getAllLinodes.started());

  try {
    const requestAction = getLinodesPage.request({ page, page_size: 100 });
    const { data, pages } = await dispatch(requestAction);

    const mergedData = [...prevData, ...data];

    if (page === pages) {
      const doneAction = getAllLinodes.done({ result: mergedData });
      return dispatch(doneAction);
    }

    if (page < pages) {
      const r = range(page + 1, pages + 1);
      const requests = r.map((nextPage) => dispatch(getLinodesPage.request({ page: nextPage, page_size: 100 })));

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
