import { getBackupsEnabledValue } from './utilities';

describe('getBackupsEnabledValue', () => {
  it('should always return true if account backups are enabled', () => {
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: true,
        isDistributedRegion: false,
        value: false,
      })
    ).toBe(true);
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: true,
        isDistributedRegion: false,
        value: true,
      })
    ).toBe(true);
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: true,
        isDistributedRegion: false,
        value: undefined,
      })
    ).toBe(true);
  });

  it('should return the form value if account backups are not enabled', () => {
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: false,
        isDistributedRegion: false,
        value: true,
      })
    ).toBe(true);
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: false,
        isDistributedRegion: false,
        value: false,
      })
    ).toBe(false);
  });

  it('should default to false if the form data is undefined', () => {
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: false,
        isDistributedRegion: false,
        value: undefined,
      })
    ).toBe(false);
  });

  it('should ignore `accountBackupsEnabled` if it is undefined', () => {
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: undefined,
        isDistributedRegion: false,
        value: false,
      })
    ).toBe(false);
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: undefined,
        isDistributedRegion: false,
        value: true,
      })
    ).toBe(true);
  });

  it('should always return false if a distributed region is selected because distributed regions do not support backups', () => {
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: undefined,
        isDistributedRegion: true,
        value: true,
      })
    ).toBe(false);
    expect(
      getBackupsEnabledValue({
        accountBackupsEnabled: undefined,
        isDistributedRegion: true,
        value: false,
      })
    ).toBe(false);
  });
});
