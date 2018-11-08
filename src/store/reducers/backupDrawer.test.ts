import * as Bluebird from 'bluebird';

import backups, * as B from './backupDrawer';

import { linode1, linode2 } from 'src/__data__/linodes';
import { mockAPIFieldErrors } from 'src/services/';

const error: BackupError = { linodeId: 123456, reason: 'Error'};
const apiError = mockAPIFieldErrors([]);
const linodes = [linode1, linode2];

const mockFn = jest.fn();
jest.mock('axios', () => ({
  default: (args: any) => mockFn(args)
}));

mockFn.mockReturnValueOnce(Promise.resolve(1));
mockFn.mockReturnValueOnce(Promise.reject());

describe("Redux backups", () => {
  describe("reducer", () => {
    it("should handle OPEN", () => {
      expect(backups(B.defaultState, B.handleOpen()))
        .toHaveProperty('open', true);
    });
    it("should handle CLOSE", () => {
      expect(backups(
        {...B.defaultState, open: true }, B.handleClose()))
        .toHaveProperty('open', false);
    });
    it("should handle ERROR", () => {
      const newState = backups(
        {...B.defaultState, loading: true }, B.handleError('Error'));
      expect(newState).toHaveProperty('loading', false);
      expect(newState).toHaveProperty('error', 'Error');
    });
    it("should handle LOAD", () => {
      const newState = backups(B.defaultState, B.startRequest());
      expect(newState).toHaveProperty('loading', true);
    });
    it("should handle SUCCESS", () => {
      const newState = backups(B.defaultState, B.handleSuccess(linodes));
      expect(newState.data).toEqual(linodes);
    });
    it("should handle ENABLE", () => {
      const newState = backups(B.defaultState, B.handleEnable());
      expect(newState).toHaveProperty('enabling', true);
    });
    it("should handle ENABLE_SUCCESS", () => {
      const newState = backups(
        {...B.defaultState, data: linodes, enabling: true},
        B.handleEnableSuccess([linode1.id])
      );
      expect(newState).toHaveProperty('enabling', false);
      expect(newState).toHaveProperty('enableSuccess', true);
      // Currently this functionality is commented out in the reducer.
      // expect(newState.data).not.toContain(linode1);
    });
    it("should handle ENABLE_ERROR", () => {
      const newState = backups(
        {...B.defaultState, enabling: true },
        B.handleEnableError([error])
      );
      expect(newState).toHaveProperty('enabling', false);
      expect(newState.enableErrors).toEqual([error]);
    });
    it("should handle RESET_ERRORS", () => {
      const newState = backups(
        {...B.defaultState, enableErrors: [error], error: apiError},
        B.handleResetError()
      );
      expect(newState).toHaveProperty('error', undefined);
      expect(newState).toHaveProperty('enableErrors', []);
    });
    it("should handle RESET_SUCCESS", () => {
      const newState = backups(
        {...B.defaultState, enableSuccess: true },
        B.handleResetSuccess()
      )
      expect(newState).toHaveProperty('enableSuccess', false)
    });
  });
  describe("magic error reducer", async () => {
    const initialValue = { success: [], errors: []};
    const accumulator = await Bluebird.reduce(linodes, B.reducer, initialValue);
    expect(accumulator).toEqual({
      success: [1],
      errors: [{
        linodeId: linode2.id,
        reason: "Backups could not be enabled for this Linode."
      }]
    });
  });
});