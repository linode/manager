import React from 'react';

import { TagCell } from 'src/components/TagCell/TagCell';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

interface Props {
  tags: string[];
}

export const VolumeEntityDetailFooter = ({ tags }: Props) => {
  const isReadOnlyAccountAccess = useRestrictedGlobalGrantCheck({
    globalGrantType: 'account_access',
    permittedGrantLevel: 'read_write',
  });

  return (
    <TagCell
      disabled={isReadOnlyAccountAccess || true}
      entity="Volume"
      sx={{
        width: '100%',
      }}
      tags={tags}
      updateTags={() => Promise.resolve()}
      view="inline"
    />
  );
};
