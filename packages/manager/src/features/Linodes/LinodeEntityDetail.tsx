import * as React from 'react';

import { EntityDetail } from 'src/components/EntityDetail/EntityDetail';
import { Notice } from 'src/components/Notice/Notice';
import { getIsEdgeRegion } from 'src/components/RegionSelect/RegionSelect.utils';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { notificationContext as _notificationContext } from 'src/features/NotificationCenter/NotificationContext';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useVPCConfigInterface } from 'src/hooks/useVPCConfigInterface';
import { useInProgressEvents } from 'src/queries/events/events';
import { useAllImagesQuery } from 'src/queries/images';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useTypeQuery } from 'src/queries/types';
import { useLinodeVolumesQuery } from 'src/queries/volumes';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';

import { LinodeEntityDetailBody } from './LinodeEntityDetailBody';
import { LinodeEntityDetailFooter } from './LinodeEntityDetailFooter';
import { LinodeEntityDetailHeader } from './LinodeEntityDetailHeader';
import { LinodeHandlers } from './LinodesLanding/LinodesLanding';
import {
  transitionText as _transitionText,
  getProgressOrDefault,
  isEventWithSecondaryLinodeStatus,
} from './transitions';

import type { Linode } from '@linode/api-v4/lib/linodes/types';
import type { TypographyProps } from 'src/components/Typography';

interface LinodeEntityDetailProps {
  id: number;
  isSummaryView?: boolean;
  linode: Linode;
  openTagDrawer: (tags: string[]) => void;
  variant?: TypographyProps['variant'];
}

export interface Props extends LinodeEntityDetailProps {
  handlers: LinodeHandlers;
}

export const LinodeEntityDetail = (props: Props) => {
  const { handlers, isSummaryView, linode, openTagDrawer, variant } = props;

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

  const {
    configInterfaceWithVPC,
    configs,
    isVPCOnlyLinode,
    vpcLinodeIsAssignedTo,
  } = useVPCConfigInterface(linode.id);

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

  const linodeIsInEdgeRegion = getIsEdgeRegion(regions ?? [], linode.region);

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
          important
          variant="warning"
        />
      )}
      <EntityDetail
        body={
          <LinodeEntityDetailBody
            configInterfaceWithVPC={configInterfaceWithVPC}
            gbRAM={linode.specs.memory / 1024}
            gbStorage={linode.specs.disk / 1024}
            ipv4={linode.ipv4}
            ipv6={trimmedIPv6}
            isVPCOnlyLinode={isVPCOnlyLinode}
            linodeId={linode.id}
            linodeIsInEdgeRegion={linodeIsInEdgeRegion}
            linodeLabel={linode.label}
            numCPUs={linode.specs.vcpus}
            numVolumes={numberOfVolumes}
            region={linode.region}
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
            openTagDrawer={openTagDrawer}
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
