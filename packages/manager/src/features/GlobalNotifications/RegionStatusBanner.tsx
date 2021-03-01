import { Region } from '@linode/api-v4/lib/regions/types';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Notice from 'src/components/Notice';
import { dcDisplayNames } from 'src/constants';
export interface Props {
  regions: Region[];
}

const getFacilitiesList = (warnings: string[]) => (
  <ul>
    {warnings.map((thisWarning) => (
      <li
        key={`facility-outage-${thisWarning}`}
        data-testid={`facility-outage-${thisWarning}`}
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
      <Typography variant="h3" style={{ paddingBottom: '5px' }}>
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
        <ExternalLink
          link="https://status.linode.com"
          text="status blog"
          hideIcon
        />{' '}
        for further information. Thank you for your patience and understanding.
      </Typography>
    </>
  );
};

export const RegionStatusBanner: React.FC<Props> = (props) => {
  const { regions } = props;

  const statusWarnings = regions
    .filter(
      (thisRegion) =>
        thisRegion.status === 'outage' && !!dcDisplayNames[thisRegion.id]
    )
    .map((thisRegion) => dcDisplayNames[thisRegion.id]);

  if (statusWarnings.length === 0) {
    return null;
  }

  return (
    <Notice warning important data-testid="status-banner">
      {renderBanner(statusWarnings)}
    </Notice>
  );
};

export default React.memo(RegionStatusBanner);
