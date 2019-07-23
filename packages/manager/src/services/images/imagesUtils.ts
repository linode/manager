import { getImages } from './images';

export const getLinodeImages = () =>
  getImages({ page: 1 }, { is_public: true });
