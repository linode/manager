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
      disabledTooltipText="You must be an unrestricted User in order to add or modify tags on Volumes."
      entityLabel="test"
      sx={{
        width: '100%',
      }}
      tags={tags}
      updateTags={() => Promise.resolve()}
      view="inline"
    />
  );
};
