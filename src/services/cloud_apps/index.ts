import { API_ROOT } from 'src/constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../index';

interface CloudApp {
  sequence: number;
  /**
   * will be something like /assets/minecraft.svg
   * front-end needs to provide the location
   */
  logo_url: string | null;
  label: string;
  stackscript_id: number;
  images: string[];
  user_defined_fields: any[];
  created: string;
  id: number;
}

export const getCloudApps = (params: any, filter: any) => {
  return Request<Linode.ResourcePage<CloudApp[]>>(
    setURL(`${API_ROOT}beta/linode/one-click-apps`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  ).then(response => response.data);
};
