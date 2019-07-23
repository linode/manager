import backups, * as B from './index';

import { linode1 } from 'src/__data__/linodes';
import { mockAPIFieldErrors } from 'src/services/';

const error: B.BackupError = { linodeId: 123456, reason: 'Error' };
const apiError = mockAPIFieldErrors([]);

describe('Redux backups', () => {
  describe('reducer', () => {
    it('should handle OPEN', () => {
      const newState = backups(
        {
          ...B.defaultState,
          error: apiError,
          enableErrors: [error],
          autoEnrollError: 'Error'
        },
        B.handleOpen()
      );
      expect(newState).toHaveProperty('open', true);
      expect(newState).toHaveProperty('error', undefined);
      expect(newState).toHaveProperty('enableErrors', []);
      expect(newState).toHaveProperty('autoEnrollError', undefined);
      expect(newState).toHaveProperty('updatedCount', 0);
    });
    it('should handle CLOSE', () => {
      const newState = backups(
        { ...B.defaultState, open: true },
        B.handleClose()
      );
      expect(newState).toHaveProperty('open', false);
    });
    it('should handle ENABLE', () => {
      const newState = backups(B.defaultState, B.handleEnable());
      expect(newState).toHaveProperty('enabling', true);
    });
    it('should handle ENABLE_SUCCESS', () => {
      const newState = backups(
        { ...B.defaultState, enabling: true },
        B.handleEnableSuccess([linode1.id])
      );
      expect(newState).toHaveProperty('enabling', false);
      expect(newState).toHaveProperty('enableSuccess', true);
      expect(newState).toHaveProperty('updatedCount', 1);
    });
    it('should handle ENABLE_ERROR', () => {
      const newState = backups(
        { ...B.defaultState, enabling: true },
        B.handleEnableError({ errors: [error], success: [1, 2, 3] })
      );
      expect(newState).toHaveProperty('enabling', false);
      expect(newState.enableErrors).toEqual([error]);
    });
    it('should handle RESET_ERRORS', () => {
      const newState = backups(
        { ...B.defaultState, enableErrors: [error], error: apiError },
        B.handleResetError()
      );
      expect(newState).toHaveProperty('error', undefined);
      expect(newState).toHaveProperty('enableErrors', []);
    });
    it('should handle RESET_SUCCESS', () => {
      const newState = backups(
        { ...B.defaultState, enableSuccess: true },
        B.handleResetSuccess()
      );
      expect(newState).toHaveProperty('enableSuccess', false);
    });
    it('should handle AUTO_ENROLL', () => {
      const newState = backups(B.defaultState, B.handleAutoEnroll());
      expect(newState).toHaveProperty('enrolling', true);
    });
    it('should handle AUTO_ENROLL_TOGGLE', () => {
      const newState = backups(
        { ...B.defaultState, autoEnroll: false },
        B.handleAutoEnrollToggle()
      );
      expect(newState).toHaveProperty('autoEnroll', true);
      expect(backups(newState, B.handleAutoEnrollToggle())).toHaveProperty(
        'autoEnroll',
        false
      );
    });
    it('should handle AUTO_ENROLL_SUCCESS', () => {
      const newState = backups(
        { ...B.defaultState, enrolling: true },
        B.handleAutoEnrollSuccess()
      );
      expect(newState).toHaveProperty('enrolling', false);
    });
    it('should handle AUTO_ENROLL_ERROR', () => {
      const newState = backups(
        { ...B.defaultState, enableSuccess: true },
        B.handleAutoEnrollError('Error')
      );
      expect(newState).toHaveProperty('autoEnrollError', 'Error');
    });
  });
});
