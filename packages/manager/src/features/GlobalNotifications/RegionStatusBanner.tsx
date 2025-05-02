import { Notice, Typography } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { useRegionsQuery } from '@linode/queries';

const getFacilitiesList = (warnings: string[]) => (
  <ul>
    {warnings.map((thisWarning) => (
      <li
        data-testid={`facility-outage-${thisWarning}`}
        key={`facility-outage-${thisWarning}`}
      >
        {thisWarning}
      </li>
    ))}
  </ul>
);

/**
 * Takes an array of region display names and outputs the appropriate
 * notice display.
 *
 * Includes conditional logic to show a list in the (rare) case that
 * more than one region is affected. Since most outages only affect
 * a single region, I thought the more compact display of a single
 * region in that case was worth the cost in complexity.
 *
 * @param statusWarnings
 */
const renderBanner = (statusWarnings: string[]): JSX.Element => {
  const moreThanOneRegionAffected = statusWarnings.length > 1;
  return (
    <>
      <Typography style={{ paddingBottom: '5px' }} variant="h3">
        We are aware of an issue affecting service in {` `}
        {moreThanOneRegionAffected
          ? 'the following facilities:'
          : `our ${statusWarnings[0]} facility.`}
      </Typography>
      {moreThanOneRegionAffected && getFacilitiesList(statusWarnings)}
      <Typography>
        If you are experiencing service issues in{' '}
        {moreThanOneRegionAffected ? 'these facilities' : 'this facility'},
        there is no need to open a support ticket at this time. Please monitor
        our{` `}
        <Link to="https://status.linode.com">status blog</Link> for further
        information. Thank you for your patience and understanding.
      </Typography>
    </>
  );
};

export const RegionStatusBanner = React.memo(() => {
  const { data: regions } = useRegionsQuery();

  const labelsOfRegionsWithOutages = regions
    ?.filter((region) => region.status === 'outage')
    .map((region) => region.label);

  if (!labelsOfRegionsWithOutages || labelsOfRegionsWithOutages?.length === 0) {
    return null;
  }

  return (
    <Notice data-testid="status-banner" variant="warning">
      {renderBanner(labelsOfRegionsWithOutages)}
    </Notice>
  );
});
