import { API_ROOT } from 'src/constants';
import Request, { setURL, setMethod, setParams } from 'src/services';

type GetImagesPage = Promise<Linode.ResourcePage<Linode.Image>>;
export const getImagesPage = (page: number): GetImagesPage => Request(
  setURL(`${API_ROOT}/images/?page=${page}`),
  setMethod('GET'),
  setParams({ page }),
)
  .then(response => response.data);

export const getImages = (): Promise<Linode.ResourcePage<Linode.Image>> =>
  getImagesPage(1);

type GetImageType = Promise<Linode.SingleResourceState<Linode.Image>>;
export const getImage = (imageId: string): GetImageType => Request(
  setURL(`${API_ROOT}/images/${imageId}`),
  setMethod('GET'),
);


