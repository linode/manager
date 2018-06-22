import { API_ROOT } from 'src/constants';
import Request, { setURL, setMethod, setParams } from 'src/services';

type Page<T> = Linode.ResourcePage<T>;
type Image = Linode.Image;

export const getImagesPage = (page: number) =>
  Request<Page<Image>>(
    setURL(`${API_ROOT}/images/?page=${page}`),
    setMethod('GET'),
    setParams({ page }),
  )
    .then(response => response.data);

export const getImages = () =>
  getImagesPage(1);

export const getImage = (imageId: string) =>
  Request<Image>(
    setURL(`${API_ROOT}/images/${imageId}`),
    setMethod('GET'),
  )
    .then(response => response.data);
