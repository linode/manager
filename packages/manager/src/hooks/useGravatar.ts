import { useEffect, useState } from 'react';

import { checkForGravatar, getGravatarUrl } from 'src/utilities/gravatar';

export function useGravatar(email: string | undefined) {
  const [hasGravatar, setHasGravatar] = useState(true);

  useEffect(() => {
    if (email) {
      checkForGravatar(getGravatarUrl(email)).then((res) =>
        setHasGravatar(res)
      );
    } else {
      setHasGravatar(false);
    }
  }, [email]);

  return hasGravatar;
}
