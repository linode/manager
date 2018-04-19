import Axios from 'axios';
import { API_ROOT } from 'src/constants';

type GetImagesType = Promise<Linode.ManyResourceState<Linode.Config>>;
export const getImages = (): GetImagesType =>
Axios.get(`${API_ROOT}/images`)
  .then(response => response.data);
