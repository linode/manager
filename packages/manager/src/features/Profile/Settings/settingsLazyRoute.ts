import { createLazyRoute } from '@tanstack/react-router';

import { ProfileSettings } from './Settings';

export const settingsLazyRoute = createLazyRoute('/profile/settings')({
  component: ProfileSettings,
});

/**
 *  @todo As part of the IAM Primary Nav flag (iamRbacPrimaryNavChanges) cleanup, /profile/settings will be removed.
 * Adding the lazy route in this file will also require the necessary cleanup work, such as renaming the file and removing settingsLazyRoute(/profile/settings), as part of the flag cleanup.
 */
export const preferencesLazyRoute = createLazyRoute('/profile/preferences')({
  component: ProfileSettings,
});
