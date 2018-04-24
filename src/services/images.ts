import Axios from 'axios';
import { API_ROOT } from 'src/constants';

type GetImagesPage = Promise<Linode.ResourcePage<Linode.Image>>;
export const getImagesPage = (page: number): GetImagesPage =>
  Axios.get(`${API_ROOT}/images/?page=${page}`)
    .then(response => response.data);

export const getImages = (): Promise<Linode.ResourcePage<Linode.Image>> =>
  getImagesPage(1);

type GetImageType = Promise<Linode.SingleResourceState<Linode.Image>>;
export const getImage = (imageId: string): GetImageType =>
  Axios.get(`${API_ROOT}/images/${imageId}`);
