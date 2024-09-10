import { useEffect, useState } from 'react';

import { checkForGravatar, getGravatarUrl } from 'src/utilities/gravatar';

// set a cache to prevent duplicate requests
const gravatarCache = new Map<string, boolean>();

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
  const [hasGravatar, setHasGravatar] = useState(
    email && gravatarCache.has(email) ? gravatarCache.get(email) : false
  );
  const [isLoadingGravatar, setIsLoadingGravatar] = useState<boolean>(true);

  useEffect(() => {
    if (!email) {
      setHasGravatar(false);
      setIsLoadingGravatar(false);
      return;
    }

    if (gravatarCache.has(email)) {
      setHasGravatar(gravatarCache.get(email));
      setIsLoadingGravatar(false);
    } else {
      checkForGravatar(getGravatarUrl(email)).then((result) => {
        gravatarCache.set(email, result);
        setHasGravatar(result);
        setIsLoadingGravatar(false);
      });
    }
  }, [email]);

  return { hasGravatar, isLoadingGravatar };
};
