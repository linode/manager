import Axios from 'axios';
import { API_ROOT } from 'src/constants';

type GetImagesPage = Promise<Linode.ManyResourceState<Linode.Image>>;
export const getImagesPage = (page: number): GetImagesPage =>
  Axios
    .get(`${API_ROOT}/images/?page=${page}`)
    .then(response => response.data);

export const getImages = (): Promise<Linode.ManyResourceState<Linode.Image>> =>
  getImagesPage(1);
