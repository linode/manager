import { imageFactory } from 'src/factories/images';

import {
  createImageActions,
  removeImage,
  requestImageForStoreActions,
  requestImagesActions,
  updateImageActions,
  upsertImage
} from './image.actions';
import reducer, { defaultState } from './image.reducer';

const mockError = [{ reason: 'an error' }];
const mockImages = imageFactory.buildList(10);
const mockImagesNormalized = mockImages.reduce((acc, thisImage) => {
  acc[thisImage.id] = thisImage;
  return acc;
}, {});
const mockParams = { diskID: 1 };
const addEntities = () =>
  reducer(defaultState, requestImagesActions.done({ result: mockImages }));

describe('Images reducer', () => {
  describe('Requesting all Images', () => {
    it('should set loading to true when starting the request', () => {
      const newState = reducer(defaultState, requestImagesActions.started());
      expect(newState.loading).toBe(true);
    });

    it('should handle a successful request', () => {
      const newState = reducer(
        { ...defaultState, loading: true },
        requestImagesActions.done({ result: mockImages })
      );
      expect(newState.data).toEqual(mockImagesNormalized);
      expect(newState.results).toEqual(mockImages.length);
      expect(newState.loading).toBe(false);
      expect(newState.lastUpdated).toBeGreaterThan(0);
    });

    it('should handle a failed request', () => {
      const newState = reducer(
        { ...defaultState, loading: true },
        requestImagesActions.failed({ error: mockError })
      );
      expect(newState.error!.read).toEqual(mockError);
      expect(newState.loading).toBe(false);
    });
  });

  describe('Upsert action', () => {
    it('should add an Image to a list where it is not already present', () => {
      const withEntities = addEntities();
      const newImage = imageFactory.build({
        id: 'private/9999',
        label: 'new-image'
      });
      const newState = reducer(withEntities, upsertImage(newImage));
      expect(newState.results).toEqual(mockImages.length + 1);
      expect(newState.data['private/9999']).toEqual(newImage);
    });

    it('should update an existing cluster', () => {
      const withEntities = addEntities();
      expect(withEntities.results).toEqual(mockImages.length);
      const updatedImage = {
        ...mockImages[1],
        label: 'updated-image-label'
      };
      const newState = reducer(withEntities, upsertImage(updatedImage));
      // Length should be unchanged
      expect(newState.results).toEqual(mockImages.length);
      expect(newState.data[mockImages[1].id]).toEqual(updatedImage);
    });
  });

  describe('removeImage action', () => {
    it('should remove an image by numeric id', () => {
      const imageToRemove = imageFactory.build({ id: 'private/12345' });
      const withImages = reducer(
        defaultState,
        requestImagesActions.done({ result: [...mockImages, imageToRemove] })
      );
      const newState = reducer(withImages, removeImage(12345));
      expect(newState.results).toEqual(mockImages.length);
      expect(newState.data['private/12345']).toBeUndefined();
    });

    it('should remove an image by full string id', () => {
      const imageToRemove = imageFactory.build({ id: 'private/12345' });
      const withImages = reducer(
        defaultState,
        requestImagesActions.done({ result: [...mockImages, imageToRemove] })
      );
      const newState = reducer(withImages, removeImage('private/12345'));
      expect(newState.results).toEqual(mockImages.length);
      expect(newState.data['private/12345']).toBeUndefined();
    });

    it("should return the state unchanged if the id doesn't match", () => {
      const withEntities = addEntities();
      const newState = reducer(withEntities, removeImage('private/12345'));
      expect(newState).toEqual(withEntities);
    });
  });

  describe('Create image actions', () => {
    it('should handle successful creation', () => {
      const newImage = imageFactory.build();
      const newState = reducer(
        defaultState,
        createImageActions.done({ result: newImage, params: mockParams })
      );
      expect(newState.data[newImage.id]).toEqual(newImage);
      expect(newState.lastUpdated).toBeGreaterThan(0);
      expect(newState.results).toEqual(1);
      expect(newState.error.create).toBeUndefined();
    });

    it('should handle failed creation', () => {
      const newState = reducer(
        defaultState,
        createImageActions.failed({ error: mockError, params: mockParams })
      );
      expect(newState.results).toEqual(0);
      expect(newState.error.create).toEqual(mockError);
      expect(newState.lastUpdated).toBe(0);
    });
  });

  describe('Update Image actions', () => {
    it('should initiate an update', () => {
      const newState = reducer(
        { ...defaultState, error: { update: mockError } },
        updateImageActions.started({ imageID: 'private/1234' })
      );
      expect(newState.error.update).toBeUndefined();
    });

    it('should handle a successful update', () => {
      const withEntities = addEntities();
      const updatedImage = { ...mockImages[1], label: 'new-label' };
      const newState = reducer(
        withEntities,
        updateImageActions.done({
          params: { imageID: updatedImage.id },
          result: updatedImage
        })
      );
      expect(newState.data[updatedImage.id]).toEqual(updatedImage);
    });

    it('should handle a failed update', () => {
      const newState = reducer(
        defaultState,
        updateImageActions.failed({
          params: { imageID: 'private/1234' },
          error: mockError
        })
      );
      expect(newState.error.update).toEqual(mockError);
    });
  });

  describe('Requesting a single Image', () => {
    it('should initiate the request', () => {
      const newState = reducer(
        { ...defaultState, error: { read: mockError } },
        requestImageForStoreActions.started('private/1234')
      );
      expect(newState.error.read).toBeUndefined();
    });

    it('should handle a successful request', () => {
      const withEntities = addEntities();
      const updatedImage = { ...mockImages[3], label: 'my-label-is-updated' };
      const newState = reducer(
        withEntities,
        requestImageForStoreActions.done({
          result: updatedImage,
          params: 'private/1234'
        })
      );
      expect(newState.data[mockImages[3].id]).toEqual(updatedImage);
    });

    it('should handle a failed request', () => {
      const newState = reducer(
        defaultState,
        requestImageForStoreActions.failed({
          params: 'private/1234',
          error: mockError
        })
      );
      expect(newState.error.read).toEqual(mockError);
    });
  });
});
