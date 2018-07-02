import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setParams, setURL, setXFilter } from 'src/services';

type Page<T> = Linode.ResourcePage<T>;
type Image = Linode.Image;

export const getImagesPage = (page: number, userOnly: boolean = false) =>
  Request<Page<Image>>(
    setURL(`${API_ROOT}/images`),
    setMethod('GET'),
    setParams({ page }),
    setXFilter({...(userOnly && {'is_public': false })}),
  )
    .then(response => response.data);

export const getImages = () =>
  getImagesPage(1);

export const getUserImages = () =>
  getImagesPage(1, true);

export const getImage = (imageId: string) =>
  Request<Image>(
    setURL(`${API_ROOT}/images/${imageId}`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const updateImage = (imageId: string, label: string, description: string) => { 
  // Blank descriptions are represented as ' ' in the API; 
  // API will return an error if passed the empty string.
  if (description=== '') { description = ' '; }
  return Request<{}>(
    setURL(`${API_ROOT}/images/${imageId}`),
    setMethod('PUT'),
    setData({ label, description }),
  );
}