import { getBackupsEnabledValue } from './utilities';

describe('getBackupsEnabledValue', () => {
  it('should always return true if account backups are enabled', () => {
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: true,
        isEdgeRegion: false,
        value: false,
      })
    ).toBe(true);
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: true,
        isEdgeRegion: false,
        value: true,
      })
    ).toBe(true);
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: true,
        isEdgeRegion: false,
        value: undefined,
      })
    ).toBe(true);
  });

  it('should return the form value if account backups are not enabled', () => {
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: false,
        isEdgeRegion: false,
        value: true,
      })
    ).toBe(true);
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: false,
        isEdgeRegion: false,
        value: false,
      })
    ).toBe(false);
  });

  it('should default to false if the form data is undefined', () => {
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: false,
        isEdgeRegion: false,
        value: undefined,
      })
    ).toBe(false);
  });

  it('should ignore `accountBackupsEnabled` if it is undefined', () => {
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: undefined,
        isEdgeRegion: false,
        value: false,
      })
    ).toBe(false);
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: undefined,
        isEdgeRegion: false,
        value: true,
      })
    ).toBe(true);
  });

  it('should always return false if an edge region is selected becuase edge regions do not support backups', () => {
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: undefined,
        isEdgeRegion: true,
        value: true,
      })
    ).toBe(false);
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: undefined,
        isEdgeRegion: true,
        value: false,
      })
    ).toBe(false);
  });
});
