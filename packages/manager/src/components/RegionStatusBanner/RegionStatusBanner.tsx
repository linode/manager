import * as React from 'react';
import { compose } from 'recompose';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Notice from 'src/components/Notice';
import { dcDisplayNames } from 'src/constants';
import RegionsContainer, {
  DefaultProps as RegionsProps
} from 'src/containers/regions.container';

export type CombinedProps = RegionsProps;

const renderBanner = (regionID: string) => {
  return (
    <>
      <Typography variant="h3" style={{ paddingBottom: '5px' }}>
        We are aware of an issue affecting service in our{' '}
        {dcDisplayNames[regionID]} facility.
      </Typography>
      <Typography>
        If you are experiencing service issues in this facility, there is no
        need to open a support ticket at this time. Please monitor our{` `}
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

export const RegionStatusBanner: React.FC<CombinedProps> = props => {
  const { regionsData } = props;

  const statusWarnings = regionsData.filter(
    thisRegion => thisRegion.status === 'outage'
  );

  if (statusWarnings.length === 0) {
    return null;
  }

  return (
    <>
      {statusWarnings.map(thisWarning => (
        <Notice
          key={`status-banner-${thisWarning.id}`}
          warning
          important
          text={renderBanner(thisWarning.id)}
        />
      ))}
    </>
  );
};

const withRegions = RegionsContainer(({ data, loading, error }) => ({
  regionsData: data,
  regionsLoading: loading,
  regionsError: error
}));

const enhanced = compose<CombinedProps, {}>(withRegions);

export default enhanced(RegionStatusBanner);
