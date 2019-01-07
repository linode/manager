import * as Bluebird from 'bluebird';
import { range } from 'ramda';

export interface APIResponsePage<T> {
  page: number,
  pages: number,
  data: T,
  results: number,
}

export type GetFromEntity = (entityId?: number, params?: any, filters?: any) => Promise<APIResponsePage<any>>;

const getAllFromEntity: (getter: GetFromEntity) => (params?: any, filter?: any) => Promise<any> =
  (getter) =>
    (entityId: number, params?: any, filter?: any) => {
      const pagination = { ...params, page_size: 100 };
      return getter(entityId, pagination, filter)
        .then(({ data: firstPageData, page, pages }) => {

          // If we only have one page, return it.
          if (page === pages) { return firstPageData; }

          // Create an iterable list of the remaining pages.
          const remainingPages = range(page + 1, pages + 1);

          //
          return Bluebird
            .map(remainingPages, nextPage =>
              getter({ ...pagination, page: nextPage }, filter).then(response => response.data),
          )
            /** We're given Linode.NodeBalancer[][], so we flatten that, and append the first page response. */
            .then(resultPages => resultPages.reduce((result, nextPage) => [...result, ...nextPage], firstPageData));
        });
    }
export default getAllFromEntity;
