import {
  BaseImagePayload,
  CreateImagePayload,
} from '@linode/api-v4/lib/images/types';
import { imageFactory } from '@src/factories';
import { makeResourcePage } from '@src/mocks/serverHandlers';
import { RecPartial } from 'factory.ts';
import {
  getAll,
  deleteById,
  isTestEntity,
  makeTestLabel,
  apiCheckErrors,
} from './common';

const oauthtoken = Cypress.env('MANAGER_OAUTH');

export const makeImageLabel = makeTestLabel;

export const getImages = (page: number = 1) => getAll(`images?page=${page}`);

// export const imagePayload: CreateImagePayload = imageFactory.build({
//   description: 'this is a test image',
//   label: 'cy-test-image',
//   diskID: 0,
// });

export const mockImage = (label = 'cy-test-image') => {
  return makeResourcePage(imageFactory.buildList(1, { label }));
};

// const imageRequest = (mockImage) => {
//   return cy.request({
//     method: 'POST',
//     url: Cypress.env('REACT_APP_API_ROOT') + '/images',
//     body: mockImage,
//     auth: {
//       bearer: oauthtoken,
//     },
//   });
// };

// export const createImage = (data = {}) => {
//   return imageRequest({ mockImage, ...data }).then((resp) => {
//     apiCheckErrors(resp);
//     console.log(`Created Linode ${resp.body.label} successfully`, resp);
//     return resp.body;
//   });
// };

export const deleteImageById = (imageId: number) =>
  deleteById('images', imageId);

export const deleteAllTestImages = () => {
  getImages().then((resp) => {
    const pages = resp.body.pages;
    for (let page = 1; page <= pages; page++) {
      getImages(page).then((resp) => {
        resp.body.data.forEach((image) => {
          if (isTestEntity(image)) {
            deleteImageById(image.id);
          }
        });
      });
    }
  });
};
