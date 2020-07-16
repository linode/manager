import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles } from 'src/components/core/styles';
import TabbedPanel from 'src/components/TabbedPanel';
import { Tab } from 'src/components/TabbedPanel/TabbedPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import VolumesLanding_CMR from 'src/features/Volumes/VolumesLanding_CMR';
import { withLinodeDetailContext } from './linodeDetailContext';

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: 'transparent'
  }
}));

const LinodeSummary_CMR = React.lazy(() =>
  import('./LinodeSummary/LinodeSummary_CMR')
);
const LinodeNetworking_CMR = React.lazy(() =>
  import('./LinodeNetworking/LinodeNetworking_CMR')
);
const LinodeAdvanced_CMR = React.lazy(() =>
  import('./LinodeAdvanced/LinodeAdvancedConfigurationsPanel_CMR')
);
const LinodeBackup_CMR = React.lazy(() =>
  import('./LinodeBackup/LinodeBackup_CMR')
);
const LinodeResize = React.lazy(() => import('./LinodeResize'));
const LinodeRescue = React.lazy(() => import('./LinodeRescue'));
const LinodeRebuild = React.lazy(() => import('./LinodeRebuild'));
const LinodeActivity_CMR = React.lazy(() =>
  import('./LinodeActivity/LinodeActivity_CMR')
);
const LinodeSettings_CMR = React.lazy(() =>
  import('./LinodeSettings/LinodeSettings_CMR')
);

type CombinedProps = ContextProps &
  RouteComponentProps<{
    linodeId: string;
  }>;

const LinodesDetailNavigation: React.FC<CombinedProps> = props => {
  const {
    linodeLabel,
    linodeConfigs,
    linodeId,
    linodeRegion,
    readOnly,
    ...routeProps
  } = props;

  const classes = useStyles();

  const tabs: Tab[] = [
    /* NB: These must correspond to the routes inside the Switch */
    // Previously Summary
    {
      render: () => <LinodeSummary_CMR />,
      title: 'Analytics'
    },
    {
      render: () => <LinodeNetworking_CMR />,
      title: 'Network'
    },
    // Previously Volumes
    {
      render: () => (
        <div
          id="tabpanel-storage"
          role="tabpanel"
          aria-labelledby="tab-storage"
        >
          <VolumesLanding_CMR
            linodeId={linodeId}
            linodeLabel={linodeLabel}
            linodeRegion={linodeRegion}
            linodeConfigs={linodeConfigs}
            readOnly={readOnly}
            fromLinodes
            removeBreadCrumb
            {...routeProps}
          />
        </div>
      ),
      title: 'Storage'
    },
    // Previously Disks/Configs
    {
      render: () => <LinodeAdvanced_CMR />,
      title: 'Configurations'
    },
    {
      render: () => <LinodeBackup_CMR />,
      title: 'Backups'
    },
    {
      render: () => <LinodeResize />,
      title: 'Resize'
    },
    {
      render: () => <LinodeRescue />,
      title: 'Rescue'
    },
    {
      render: () => <LinodeRebuild />,
      title: 'Rebuild'
    },
    {
      render: () => <LinodeActivity_CMR />,
      title: 'Activity Logs'
    },
    {
      render: () => <LinodeSettings_CMR />,
      title: 'Settings'
    }
  ];

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <TabbedPanel
        rootClass={`${classes.root} tabbedPanel`}
        header={''}
        tabs={tabs}
        initTab={0}
      />
    </React.Suspense>
  );
};

interface ContextProps {
  linodeId: number;
  linodeConfigs: Config[];
  linodeLabel: string;
  linodeRegion: string;
  readOnly: boolean;
}

const enhanced = compose<CombinedProps, {}>(
  withRouter,
  withLinodeDetailContext<ContextProps>(({ linode }) => ({
    linodeId: linode.id,
    linodeConfigs: linode._configs,
    linodeLabel: linode.label,
    linodeRegion: linode.region,
    readOnly: linode._permissions === 'read_only'
  }))
);

export default enhanced(LinodesDetailNavigation);
