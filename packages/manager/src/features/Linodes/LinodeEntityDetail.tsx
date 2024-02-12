import * as React from 'react';

import { EntityDetail } from 'src/components/EntityDetail/EntityDetail';
import { notificationContext as _notificationContext } from 'src/features/NotificationCenter/NotificationContext';
import { useVPCConfigInterface } from 'src/hooks/useVPCConfigInterface';
import { useInProgressEvents } from 'src/queries/events/events';
import { useAllImagesQuery } from 'src/queries/images';
import { useRegionsQuery } from 'src/queries/regions';
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

export type Props = LinodeEntityDetailProps & {
  handlers: LinodeHandlers;
};

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
    showVPCs,
    vpcLinodeIsAssignedTo,
  } = useVPCConfigInterface(linode.id);

  const imageVendor =
    images?.find((i) => i.id === linode.image)?.vendor ?? null;

  const linodePlan = type ? formatStorageUnits(type.label) : linode.type;

  const linodeRegionDisplay =
    regions?.find((r) => r.id === linode.region)?.label ?? linode.region;

  let progress;
  let transitionText;

  if (recentEvent && isEventWithSecondaryLinodeStatus(recentEvent, linode.id)) {
    progress = getProgressOrDefault(recentEvent);
    transitionText = _transitionText(linode.status, linode.id, recentEvent);
  }

  const trimmedIPv6 = linode.ipv6?.replace('/128', '') || null;

  return (
    <EntityDetail
      body={
        <LinodeEntityDetailBody
          configInterfaceWithVPC={configInterfaceWithVPC}
          displayVPCSection={showVPCs}
          gbRAM={linode.specs.memory / 1024}
          gbStorage={linode.specs.disk / 1024}
          ipv4={linode.ipv4}
          ipv6={trimmedIPv6}
          isVPCOnlyLinode={isVPCOnlyLinode}
          linodeId={linode.id}
          linodeLabel={linode.label}
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
          openTagDrawer={openTagDrawer}
        />
      }
      header={
        <LinodeEntityDetailHeader
          backups={linode.backups}
          configs={configs}
          enableVPCLogic={showVPCs}
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
  );
};
