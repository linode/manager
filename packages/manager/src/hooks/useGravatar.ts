import { useEffect, useState } from 'react';

import { checkForGravatar, getGravatarUrl } from 'src/utilities/gravatar';

// set a cache to prevent duplicate requests
const gravatarCache: Record<string, boolean> = {};

/**
 * useGravatar
 *
 * @description
 * This hook checks if a user has a Gravatar associated with their email.
 * It uses a cache to prevent duplicate requests.
 *
 * @param email - The email address to check for a Gravatar.
 * @returns - A boolean indicating whether the user has a Gravatar.
 */
export const useGravatar = (email: string | undefined) => {
  const [hasGravatar, setHasGravatar] = useState(false);
  const [isLoadingGravatar, setIsLoadingGravatar] = useState<boolean>(true);

  useEffect(() => {
    if (!email) {
      setHasGravatar(false);
      setIsLoadingGravatar(false);

      return;
    }

    if (gravatarCache.hasOwnProperty(email)) {
      setHasGravatar(gravatarCache[email]);
      setIsLoadingGravatar(false);
    } else {
      checkForGravatar(getGravatarUrl(email)).then((result) => {
        gravatarCache[email] = result;
        setHasGravatar(result);
        setIsLoadingGravatar(false);
      });
    }
  }, [email]);

  return { hasGravatar, isLoadingGravatar };
};
