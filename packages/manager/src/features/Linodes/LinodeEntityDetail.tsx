import {
  useAllImagesQuery,
  useLinodeVolumesQuery,
  useRegionsQuery,
  useTypeQuery,
} from '@linode/queries';
import { Notice } from '@linode/ui';
import { formatStorageUnits } from '@linode/utilities';
import * as React from 'react';

import { EntityDetail } from 'src/components/EntityDetail/EntityDetail';
import { getIsDistributedRegion } from 'src/components/RegionSelect/RegionSelect.utils';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { notificationCenterContext as _notificationContext } from 'src/features/NotificationCenter/NotificationCenterContext';
import { useDetermineUnreachableIPs } from 'src/hooks/useDetermineUnreachableIPs';
import { useInProgressEvents } from 'src/queries/events/events';

import { usePermissions } from '../IAM/hooks/usePermissions';
import { LinodeEntityDetailBody } from './LinodeEntityDetailBody';
import { LinodeEntityDetailFooter } from './LinodeEntityDetailFooter';
import { LinodeEntityDetailHeader } from './LinodeEntityDetailHeader';
import {
  transitionText as _transitionText,
  getProgressOrDefault,
  isEventWithSecondaryLinodeStatus,
} from './transitions';

import type { LinodeHandlers } from './LinodesLanding/LinodesLanding';
import type { TypographyProps } from '@linode/ui';
import type { LinodeWithMaintenance } from 'src/utilities/linodes';

interface LinodeEntityDetailProps {
  id: number;
  isSummaryView?: boolean;
  linode: LinodeWithMaintenance;
  variant?: TypographyProps['variant'];
}

export interface Props extends LinodeEntityDetailProps {
  handlers: LinodeHandlers;
}

export const LinodeEntityDetail = (props: Props) => {
  const { handlers, isSummaryView, linode, variant } = props;

  const notificationContext = React.useContext(_notificationContext);

  const { data: events } = useInProgressEvents();

  const recentEvent = events?.find(
    (event) => event.entity?.id === linode.id && event.entity.type === 'linode'
  );

  const { data: images } = useAllImagesQuery({}, {});

  const { data: type } = useTypeQuery(linode.type ?? '', Boolean(linode.type));

  const { data: volumes } = useLinodeVolumesQuery(linode.id);

  const numberOfVolumes = volumes?.results ?? 0;

  const { data: regions } = useRegionsQuery();

  const isLinodeInterface = linode.interface_generation === 'linode';

  const {
    configs,
    isUnreachablePublicIPv4,
    isUnreachablePublicIPv6,
    interfaceWithVPC,
    vpcLinodeIsAssignedTo,
  } = useDetermineUnreachableIPs({
    isLinodeInterface,
    linodeId: linode.id,
  });

  const { data: permissions } = usePermissions(
    'linode',
    ['update_linode'],
    linode.id
  );

  const imageVendor =
    images?.find((i) => i.id === linode.image)?.vendor ?? null;

  const linodePlan = type ? formatStorageUnits(type.label) : linode.type;

  const linodeRegionDisplay =
    regions?.find((r) => r.id === linode.region)?.label ?? linode.region;

  const linodeIsInDistributedRegion = getIsDistributedRegion(
    regions ?? [],
    linode.region
  );

  let progress;
  let transitionText;

  if (recentEvent && isEventWithSecondaryLinodeStatus(recentEvent, linode.id)) {
    progress = getProgressOrDefault(recentEvent);
    transitionText = _transitionText(linode.status, linode.id, recentEvent);
  }

  const trimmedIPv6 = linode.ipv6?.replace('/128', '') || null;

  return (
    <>
      {!permissions.update_linode && (
        <Notice
          text={getRestrictedResourceText({
            resourceType: 'Linodes',
          })}
          variant="warning"
        />
      )}
      <EntityDetail
        body={
          <LinodeEntityDetailBody
            encryptionStatus={linode.disk_encryption}
            gbRAM={linode.specs.memory / 1024}
            gbStorage={linode.specs.disk / 1024}
            interfaceGeneration={linode.interface_generation}
            interfaceWithVPC={interfaceWithVPC}
            ipv4={linode.ipv4}
            ipv6={trimmedIPv6}
            isUnreachablePublicIPv4={isUnreachablePublicIPv4}
            isUnreachablePublicIPv6={isUnreachablePublicIPv6}
            linodeCapabilities={linode.capabilities}
            linodeId={linode.id}
            linodeIsInDistributedRegion={linodeIsInDistributedRegion}
            linodeLabel={linode.label}
            linodeLkeClusterId={linode.lke_cluster_id}
            numCPUs={linode.specs.vcpus}
            numVolumes={numberOfVolumes}
            region={linode.region}
            vpcLinodeIsAssignedTo={vpcLinodeIsAssignedTo}
          />
        }
        footer={
          <LinodeEntityDetailFooter
            linodeCreated={linode.created}
            linodeId={linode.id}
            linodeLabel={linode.label}
            linodePlan={linodePlan}
            linodeRegionDisplay={linodeRegionDisplay}
            linodeTags={linode.tags}
          />
        }
        header={
          <LinodeEntityDetailHeader
            backups={linode.backups}
            configs={configs}
            handlers={handlers}
            image={linode.image ?? 'Unknown Image'}
            imageVendor={imageVendor}
            isSummaryView={isSummaryView}
            linodeId={linode.id}
            linodeLabel={linode.label}
            linodeMaintenancePolicySet={
              linode.maintenance?.maintenance_policy_set ??
              linode.maintenance_policy // Attempt to use ongoing maintenance policy. Otherwise, fallback to policy set on Linode.
            }
            linodeRegionDisplay={linodeRegionDisplay}
            linodeStatus={linode.status}
            maintenance={linode.maintenance ?? null}
            openNotificationMenu={notificationContext.openMenu}
            progress={progress}
            transitionText={transitionText}
            type={type ?? null}
            variant={variant}
          />
        }
      />
    </>
  );
};
