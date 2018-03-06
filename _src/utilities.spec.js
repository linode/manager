import { removeSelected } from './actions/select';
import { showModal } from './actions/modal';

import {
  deleteModalProps,
  isPathOneOf,
  getLinodeByLabel,
  confirmThenDelete,
} from './utilities';

jest.mock('./actions/select', () => ({
  removeSelected: jest.fn(),
}));

jest.mock('./actions/modal.js', () => ({
  showModal: jest.fn(),
}));

describe('utilities', () => {
  describe('confirmThenDelete', () => {
    const mockDispatch = jest.fn();
    const mockDeleteFunction = jest.fn();
    const confirmThenDeleteFn = confirmThenDelete(
      mockDispatch,
      'something',
      mockDeleteFunction,
      'something'
    );

    it('should return a function', () => {
      expect(confirmThenDeleteFn).toBeInstanceOf(Function);
    });

    describe('function calls', () => {
      beforeEach(async () => {
        jest.clearAllMocks();
        confirmThenDeleteFn([{ label: 'something', id: 1 }, { label: 'whatever', id: 99 }]);
      });

      it('should call dispatch', () => {
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });

      it('should showModal', () => {
        expect(showModal).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('deleteModalProps', () => {
    const mockDispatch = jest.fn();
    const mockDeleteMethod = jest.fn();
    const mockHideModal = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('return the expected shape.', () => {
      const result = deleteModalProps(
        mockDispatch,
        [
          { label: 'shenanigans', id: 1 },
          { label: 'notShenanigans', id: 2 },
          { label: 'shenanigans', id: 3 },
          { label: 'notShenanigans', id: 4 },
          { label: 'shenanigans', id: 5 },
        ],
        mockDeleteMethod,
        'something',
        'something',
        mockHideModal,
        'label',
        'id'
      );

      expect(result).toEqual(
        expect.objectContaining({
          deleteAction: 'delete',
          deleteActionPending: 'deleting',
          items: [
            'shenanigans',
            'notShenanigans',
            'shenanigans',
            'notShenanigans',
            'shenanigans',
          ],
          name: 'massDeletesomething',
          onCancel: mockHideModal,
          title: 'Delete Somethings',
          typeOfItem: 'Somethings',
        })
      );
      expect(result.onSubmit).toBeInstanceOf(Function);
    });

    describe('onSubmit calls', () => {
      const mockDispatch = jest.fn();
      const mockDeleteMethod = jest.fn();
      const mockHideModal = jest.fn();

      const result = deleteModalProps(
        mockDispatch,
        [
          { label: 'somethings', id: 1 },
          { label: 'something', id: 2 },
          { label: 'something', id: 3 },
        ],
        mockDeleteMethod,
        'something',
        'something',
        mockHideModal,
        'label',
        'id'
      );

      beforeEach(async () => {
        await result.onSubmit();
      });

      it('mockDispatch', () => {
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });

      it('mockHideModal', () => {
        expect(mockHideModal).toHaveBeenCalledTimes(1);
      });

      it('removeSelected with type and IDs', () => {
        expect(removeSelected).toHaveBeenLastCalledWith('something', [1, 2, 3]);
      });
    });
  });

  describe('isPathOneOf', () => {
    it('should return true when path is one of', () => {
      const result = isPathOneOf(
        ['/linodes'],
        '/linodes/1234'
      );

      expect(result).toBe(true);
    });

    it('should return false when path is not one of', () => {
      const result = isPathOneOf(
        ['/linodes'],
        '/shenanigans/1234'
      );

      expect(result).toBe(false);
    });
  });

  describe('getLinodeByLabel', () => {
    it('should return the first matchiung Linode', () => {
      const list = [
        { label: 'ABC' },
        { label: 'DEF' },
        { label: 'GHI' },
      ];
      const result = getLinodeByLabel(list, 'DEF');
      expect(result).toEqual({ label: 'DEF' });
    });

    it('should return undefined if Linode is not found.', () => {
      const list = [
        { label: 'ABC' },
        { label: 'DEF' },
        { label: 'GHI' },
      ];
      const result = getLinodeByLabel(list, 'XYZ');
      expect(result).toBeUndefined;
    });
  });
});
