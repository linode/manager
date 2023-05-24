import * as React from 'react';
import { Capabilities } from '@linode/api-v4/lib/regions/types';
import Typography from 'src/components/core/Typography';
import { Notice } from 'src/components/Notice/Notice';
import { useRegionsQuery } from 'src/queries/regions';
import arrayToList from 'src/utilities/arrayToDelimiterSeparatedList';
import { useSelectPlanPanelStyles } from './Styles/selectPlanPanelStyles';

interface Props {
  hasDisabledClass: boolean;
  dataTestId?: string;
}

export const MetalNotice = ({ hasDisabledClass }: Props) => {
  const { classes } = useSelectPlanPanelStyles();
  const { data: regions } = useRegionsQuery();

  const getRegionsWithCapability = (capability: Capabilities) => {
    const withCapability = regions
      ?.filter((thisRegion) => thisRegion.capabilities.includes(capability))
      .map((thisRegion) => thisRegion.label);
    return arrayToList(withCapability ?? []);
  };

  const programInfo = hasDisabledClass ? (
    // Until BM-426 is merged, we aren't filtering for regions in getDisabledClass
    // so this branch will never run.
    <Typography className={hasDisabledClass ? classes.gpuGuideLink : ''}>
      hasDisabledClass? `Bare Metal instances are not available in the selected
      region. Currently these plans are only available in $
      {getRegionsWithCapability('Bare Metal')}
      .` : ' Bare Metal Linodes have limited availability and may not be
      available at the time of your request. Some additional verification may be
      required to access these services.'
    </Typography>
  ) : (
    <Typography></Typography>
  );
  return (
    <Notice warning dataTestId="metal-notice">
      {programInfo}
    </Notice>
  );
};
