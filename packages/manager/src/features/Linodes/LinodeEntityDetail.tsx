import {
  useAllImagesQuery,
  useLinodeVolumesQuery,
  useRegionsQuery,
} from '@linode/queries';
import { Notice } from '@linode/ui';
import { formatStorageUnits } from '@linode/utilities';
import * as React from 'react';

import { EntityDetail } from 'src/components/EntityDetail/EntityDetail';
import { getIsDistributedRegion } from 'src/components/RegionSelect/RegionSelect.utils';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { notificationCenterContext as _notificationContext } from 'src/features/NotificationCenter/NotificationCenterContext';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useVPCInterface } from 'src/hooks/useVPCInterface';
import { useInProgressEvents } from 'src/queries/events/events';
import { useTypeQuery } from 'src/queries/types';

import { LinodeEntityDetailBody } from './LinodeEntityDetailBody';
import { LinodeEntityDetailFooter } from './LinodeEntityDetailFooter';
import { LinodeEntityDetailHeader } from './LinodeEntityDetailHeader';
import {
  transitionText as _transitionText,
  getProgressOrDefault,
  isEventWithSecondaryLinodeStatus,
} from './transitions';

import type { LinodeHandlers } from './LinodesLanding/LinodesLanding';
import type { Linode } from '@linode/api-v4/lib/linodes/types';
import type { TypographyProps } from '@linode/ui';

interface LinodeEntityDetailProps {
  id: number;
  isSummaryView?: boolean;
  linode: Linode;
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

  const { configs, interfaceWithVPC, isVPCOnlyLinode, vpcLinodeIsAssignedTo } =
    useVPCInterface({
      isLinodeInterface,
      linodeId: linode.id,
    });

  const isLinodesGrantReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'linode',
    id: linode.id,
  });

  const imageVendor =
    images?.find((i) => i.id === linode.image)?.vendor ?? null;

  const linodePlan = type ? formatStorageUnits(type.label) : linode.type;

  const linodeRegionDisplay =
    regions?.find((r) => r.id === linode.region)?.label ?? linode.region;

  const linodeIsInDistributedRegion = getIsDistributedRegion(
    regions ?? [],
    linode.region
  );

  const regionSupportsDiskEncryption =
    (regions
      ?.find((r) => r.id === linode.region)
      ?.capabilities.includes('Disk Encryption') ||
      regions
        ?.find((r) => r.id === linode.region)
        ?.capabilities.includes('LA Disk Encryption')) ??
    false;

  let progress;
  let transitionText;

  if (recentEvent && isEventWithSecondaryLinodeStatus(recentEvent, linode.id)) {
    progress = getProgressOrDefault(recentEvent);
    transitionText = _transitionText(linode.status, linode.id, recentEvent);
  }

  const trimmedIPv6 = linode.ipv6?.replace('/128', '') || null;

  return (
    <>
      {isLinodesGrantReadOnly && (
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
            isLKELinode={Boolean(linode.lke_cluster_id)}
            isVPCOnlyLinode={isVPCOnlyLinode}
            linodeCapabilities={linode.capabilities}
            linodeId={linode.id}
            linodeIsInDistributedRegion={linodeIsInDistributedRegion}
            linodeLabel={linode.label}
            linodeLkeClusterId={linode.lke_cluster_id}
            numCPUs={linode.specs.vcpus}
            numVolumes={numberOfVolumes}
            region={linode.region}
            regionSupportsDiskEncryption={regionSupportsDiskEncryption}
            vpcLinodeIsAssignedTo={vpcLinodeIsAssignedTo}
          />
        }
        footer={
          <LinodeEntityDetailFooter
            isLinodesGrantReadOnly={isLinodesGrantReadOnly}
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
            linodeRegionDisplay={linodeRegionDisplay}
            linodeStatus={linode.status}
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
