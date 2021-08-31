import * as React from 'react';
import { IncidentBanner } from 'src/features/Help/StatusBanners';
// import Typography from 'src/components/core/Typography';
// import Grid from 'src/components/Grid';
// import Notice from 'src/components/Notice';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';
import { Maintenance, useMaintenanceQuery } from 'src/queries/statusPage';

interface Props {
  apiMaintenanceIds: string[];
}

export const APIMaintenanceBanner: React.FC<Props> = (props) => {
  const { apiMaintenanceIds } = props;

  const {
    dismissNotifications,
    hasDismissedNotifications,
  } = useDismissibleNotifications();

  const { data: maintenancesData } = useMaintenanceQuery();
  const maintenances = maintenancesData?.scheduled_maintenances ?? [];

  const apiMaintenances = maintenances.filter((maintenance) =>
    apiMaintenanceIds.includes(maintenance.id)
  );

  if (!maintenances || maintenances.length === 0) {
    return null;
  }

  if (!apiMaintenances) {
    return null;
  }

  if (hasDismissedNotifications(apiMaintenances)) {
    return null;
  }

  // const onDismiss = () => {
  //   dismissNotifications(apiMaintenances);
  // };

  const renderBanner = (apiMaintenance: Maintenance) => {
    const mostRecentUpdate = apiMaintenance.incident_updates.filter(
      (thisUpdate) => thisUpdate.status !== 'postmortem'
    )[0];

    return (
      <IncidentBanner
        key={apiMaintenance.id}
        title={apiMaintenance.name}
        message={mostRecentUpdate?.body ?? ''}
        status={apiMaintenance.status as any}
        impact={apiMaintenance.impact}
        href={apiMaintenance.shortlink}
      />
      // <Grid item xs={12} key={apiMaintenance.id}>
      //   <Notice important warning dismissible onClose={onDismiss}>
      //     <Typography>{apiMaintenance.incident_updates[0].body}</Typography>
      //   </Notice>
      // </Grid>
    );
  };

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>{apiMaintenances.map((apiMaintenance) => renderBanner(apiMaintenance))}</>
  );
};

export default React.memo(APIMaintenanceBanner);
