import { LinodeBackupsResponse } from 'linode-js-sdk/lib/linodes';
import { collectBackups, mostRecentFromResponse } from './backups';

const notTheMostRecent = `1999-12-01T00:00:00`;

const mostRecent = `2020-12-01T00:00:00`;
describe('utilities/backups', () => {
  describe('collectBackups', () => {
    it('should return a filtered list of back-ups', () => {
      const automatic = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const response = {
        automatic,
        snapshot: {
          current: null,
          in_progress: null
        }
      } as LinodeBackupsResponse;

      expect(collectBackups(response)).toEqual(automatic);
    });

    it('should not bomb out if "snapshot" comes back as null/undefined from the API', () => {
      /**
       * snapshot should never come back as null or undefined from the API, but
       * we were getting Sentry errors from this function when trying to access snapshot.whatever.
       * It's unclear how this happens, but we should handle the case without crashing.
       */
      const automatic = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const response = {
        automatic,
        snapshot: null
      } as any;

      expect(collectBackups(response)).toEqual(automatic);
    });
  });

  describe('mostRecentFromResponse', () => {
    describe('when backups exists', () => {
      describe('and automatic contains most recent', () => {
        it('should return it', () => {
          const response = {
            automatic: [
              {
                status: 'failed',
                finished: notTheMostRecent
              },
              {
                status: 'successful',
                finished: mostRecent
              },
              {
                status: 'successful',
                finished: notTheMostRecent
              }
            ],
            snapshot: {
              in_progress: {
                status: 'successful',
                finished: notTheMostRecent
              },
              current: null
            }
          } as LinodeBackupsResponse;

          expect(mostRecentFromResponse(response)).toEqual(mostRecent);
        });
      });

      describe('and in_progress snapshot is the most recent', () => {
        it('should return it', () => {
          const response = {
            automatic: [
              {
                status: 'successful',
                finished: notTheMostRecent
              },
              {
                status: 'successful',
                finished: notTheMostRecent
              },
              {
                status: 'successful',
                finished: notTheMostRecent
              }
            ],
            snapshot: {
              in_progress: null,
              current: {
                status: 'successful',
                finished: mostRecent
              }
            }
          } as LinodeBackupsResponse;

          expect(mostRecentFromResponse(response)).toEqual(mostRecent);
        });
      });

      describe('and current snapshot is the most recent', () => {
        it('should return it', () => {
          const response = {
            automatic: [
              {
                status: 'successful',
                finished: notTheMostRecent
              },
              {
                status: 'successful',
                finished: notTheMostRecent
              },
              {
                status: 'successful',
                finished: notTheMostRecent
              }
            ],
            snapshot: {
              in_progress: {
                status: 'successful',
                finished: mostRecent
              },
              current: null
            }
          } as LinodeBackupsResponse;

          expect(mostRecentFromResponse(response)).toEqual(mostRecent);
        });
      });
    });

    describe('when no backup exists', () => {
      it('should return null', () => {
        const response = {
          automatic: [],
          snapshot: {
            current: null,
            in_progress: null
          }
        } as LinodeBackupsResponse;

        expect(mostRecentFromResponse(response)).toBe(null);
      });
    });

    describe('when no successful backups are found', () => {
      it('should return null', () => {
        const response = {
          automatic: [
            {
              status: 'failed',
              finished: mostRecent
            },
            {
              status: 'failed',
              finished: notTheMostRecent
            },
            {
              status: 'failed',
              finished: notTheMostRecent
            }
          ],
          snapshot: {
            in_progress: {
              status: 'failed',
              finished: mostRecent
            },
            current: null
          }
        } as LinodeBackupsResponse;

        expect(mostRecentFromResponse(response)).toBe(null);
      });
    });
  });
});
