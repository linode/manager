import { getFailureNotificationText } from './utils';

describe('getFailureNotificationText', () => {
  it('has message for when all enables fail', () => {
    expect(
      getFailureNotificationText({ failedCount: 5, successCount: 0 })
    ).toBe('There was an error enabling backups for your Linodes.');
  });
  it('explains that some enabling some backups succeeded', () => {
    expect(
      getFailureNotificationText({ failedCount: 5, successCount: 10 })
    ).toBe(
      'Enabled backups successfully for 10 Linodes, but 5 Linodes failed.'
    );
  });
  it('handles single success', () => {
    expect(
      getFailureNotificationText({ failedCount: 5, successCount: 1 })
    ).toBe('Enabled backups successfully for 1 Linode, but 5 Linodes failed.');
  });
  it('handles single failure', () => {
    expect(
      getFailureNotificationText({ failedCount: 1, successCount: 5 })
    ).toBe('Enabled backups successfully for 5 Linodes, but 1 Linode failed.');
  });
});
