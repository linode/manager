import { backupsToList } from './BackupPage';

describe('src/linodes/linode/backups/layouts/BackupPage', () => {
  describe('backupsToList', () => {
    const backup1 = { id: 0 };
    const backup2 = { id: 1 };
    const backup3 = { id: 2 };
    const backup4 = { id: 3 };
    const backup5 = { id: 4 };

    const mockResponse = {
      automatic: [
        backup1, backup2, backup3,
      ],
      snapshot: { current: null, in_progress: null },
    };

    it('should return a list of automatic backups.', () => {
      expect(
        backupsToList(mockResponse)
      ).toEqual([backup1, backup2, backup3]);
    });

    it('should return a list including current snapshot.', () => {
      const withCurrentSnapshot = mockResponse;
      withCurrentSnapshot.snapshot.current = backup4;

      expect(
        backupsToList(withCurrentSnapshot)
      ).toEqual([backup1, backup2, backup3, backup4]);
    });

    it('should should return a list including in progress snapshot.', () => {
      const withInProgressSnapshot = mockResponse;
      withInProgressSnapshot.snapshot.current = backup5;

      expect(
        backupsToList(withInProgressSnapshot)
      ).toEqual([backup1, backup2, backup3, backup5]);
    });
  });
});
