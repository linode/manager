import * as Bluebird from 'bluebird';
import { getDomains } from 'src/services/domains';
import { getImages } from 'src/services/images';
import { getDeprecatedLinodeTypes, getLinodeKernels, getLinodes, getLinodeTypes } from 'src/services/linodes';
import { getNodeBalancers } from 'src/services/nodebalancers';
import { getVolumes } from 'src/services/volumes';
import getAll from './getAll';
import sendGetAllRequestToAnalytics from './sendGetAllRequestToAnalytics';

export const getAllDeprecatedTypes = getAll<Linode.LinodeType>(getDeprecatedLinodeTypes);

export const getAllDomains = getAll<Linode.Domain>(getDomains);

export const getAllImages = getAll<Linode.Image>(getImages);

export const getAllKernels = getAll<Linode.Kernel>(getLinodeKernels);

export const getAllLinodes = getAll<Linode.Linode>(getLinodes);

export const getAllNodeBalancers = getAll<Linode.NodeBalancer>(getNodeBalancers);

export const getAllTypes = getAll<Linode.LinodeType>(getLinodeTypes);

export const getAllVolumes = getAll<Linode.Volume>(getVolumes);

export type GetAllHandler = (linodes: Linode.Linode[], nodebalancers: Linode.NodeBalancer[], volumes: Linode.Volume[], domains: Linode.Domain[]) => any;

/**
 * getAllEntities
 *
 * Uses getAll to request all instances of each type of entity and return
 * a 2d array of the combined results.
 *
 * @param cb Function that will be called after all requests have completed
 * with a 2d array of all the returned entities.
 */
export const getAllEntities = (cb: GetAllHandler) =>
  Bluebird.join(
    getAllLinodes(),
    getAllNodeBalancers(),
    getAllVolumes(),
    getAllDomains(),
    /** for some reason typescript thinks ...results is implicitly typed as 'any' */
    // @ts-ignore
    (...results) => {

      const resultData = [
        results[0].data,
        results[1].data,
        results[2].data,
        results[3].data,
      ]

      /** total number of entities returned, as determined by the results API property */
      const numOfEntities = results[0].results
        + results[1].results
        + results[2].results
        + results[3].results
      sendGetAllRequestToAnalytics(numOfEntities);
      /** for some reason typescript thinks ...results is implicitly typed as 'any' */
      // @ts-ignore
      cb(...resultData)
    }
  );

  export default getAllEntities;

