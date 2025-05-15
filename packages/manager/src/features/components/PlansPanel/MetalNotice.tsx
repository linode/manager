import { useRegionsQuery } from '@linode/queries';
import { Notice } from '@linode/ui';
import * as React from 'react';

import { StyledTypography } from './PlansPanel.styles';
import { getRegionsWithCapability } from './utils';

interface Props {
  dataTestId?: string;
  hasDisabledClass: boolean;
}

export const MetalNotice = (props: Props) => {
  const { dataTestId, hasDisabledClass } = props;

  const { data: regions } = useRegionsQuery();

  // Until BM-426 is merged, we aren't filtering for regions in getDisabledClass
  // so this branch will never run.
  const programInfo = hasDisabledClass ? (
    `Bare Metal instances are not available in the selected
  region. Currently these plans are only available in ${getRegionsWithCapability(
    'Bare Metal',
    regions ?? []
  )}.`
  ) : (
    <StyledTypography>
      Bare Metal Linodes have limited availability and may not be available at
      the time of your request. Some additional verification may be required to
      access these services.
    </StyledTypography>
  );

  return (
    <Notice dataTestId={dataTestId} variant="warning">
      {programInfo}
    </Notice>
  );
};
