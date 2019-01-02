import * as React from 'react';
import { compose } from 'recompose';
import Flag from 'src/assets/icons/flag.svg';
import Tooltip from 'src/components/core/Tooltip';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import withImages from 'src/containers/withImages.container';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { linodeInTransition } from 'src/features/linodes/transitions';
import getLinodeDescription from 'src/utilities/getLinodeDescription';
import hasMutationAvailable, { HasMutationAvailable } from '../hasMutationAvailable';
import IPAddress from '../IPAddress';
import LinodeActionMenu from '../LinodeActionMenu';
import RegionIndicator from '../RegionIndicator';
import withDisplayType, { WithDisplayType } from '../withDisplayType';
import withNotifications, { WithNotifications } from '../withNotifications';
import withRecentEvent, { WithRecentEvent } from '../withRecentEvent';
import styled, { StyleProps } from './LinodeRow.style';
import LinodeRowBackupCell from './LinodeRowBackupCell';
import LinodeRowHeadCell from './LinodeRowHeadCell';
import LinodeRowLoading from './LinodeRowLoading';
import LinodeRowTagCell from './LinodeRowTagCell';

interface Props {
  linodeBackups: Linode.LinodeBackups;
  linodeId: number;
  linodeImage: string | null;
  linodeIpv4: string[];
  linodeIpv6: string;
  linodeLabel: string;
  linodeRegion: string;
  linodeSpecs: Linode.LinodeSpecs;
  linodeStatus: Linode.LinodeStatus;
  linodeType: null | string;
  linodeTags: string[];
  mostRecentBackup?: string;
  openConfigDrawer: (configs: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction, linodeId: number, linodeLabel: string) => void;
}

export type CombinedProps =
  & Props
  & HasMutationAvailable
  & WithDisplayType
  & WithImagesProps
  & WithRecentEvent
  & WithNotifications
  & StyleProps

export const LinodeRow: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    displayType,
    imagesData,
    linodeBackups,
    linodeId,
    linodeImage,
    linodeIpv4,
    linodeIpv6,
    linodeLabel,
    linodeNotifications,
    linodeRegion,
    linodeSpecs: {
      memory,
      disk,
      vcpus,
    },
    linodeStatus,
    linodeTags,
    mostRecentBackup,
    mutationAvailable,
    openConfigDrawer,
    toggleConfirmation,
    // displayType, @todo use for M3-2059
    recentEvent,
  } = props;
  const loading = linodeInTransition(linodeStatus, recentEvent);

  const description = getLinodeDescription(
    displayType,
    memory,
    disk,
    vcpus,
    linodeImage,
    imagesData,
    )

  const headCell = <LinodeRowHeadCell
    loading={loading}
    linodeDescription={description}
    linodeId={linodeId}
    linodeRecentEvent={recentEvent}
    linodeLabel={linodeLabel}
    linodeStatus={linodeStatus}
  />

  return (
    <React.Fragment>
      {loading && <LinodeRowLoading linodeStatus={linodeStatus} linodeId={linodeId} linodeRecentEvent={recentEvent}>
        {headCell}
      </ LinodeRowLoading>}
      <TableRow
        key={linodeId}
        className={classes.bodyRow}
        data-qa-loading
        data-qa-linode={linodeLabel}
        rowLink={`/linodes/${linodeId}`}
        arial-label={linodeLabel}
      >
      {!loading && headCell}
        <LinodeRowTagCell tags={linodeTags} />
        <LinodeRowBackupCell linodeId={linodeId} mostRecentBackup={mostRecentBackup} />
        <TableCell parentColumn="IP Addresses" className={classes.ipCell} data-qa-ips>
          <div className={classes.ipCellWrapper}>
            <IPAddress ips={linodeIpv4} copyRight />
            <IPAddress ips={[linodeIpv6]} copyRight />
          </div>
        </TableCell>
        <TableCell parentColumn="Region" className={classes.regionCell} data-qa-region>
          <RegionIndicator region={linodeRegion} />
        </TableCell>
        <TableCell className={classes.actionCell} data-qa-notifications>
          <div className={classes.actionInner}>
            <RenderFlag
              mutationAvailable={mutationAvailable}
              linodeNotifications={linodeNotifications}
              classes={classes}
            />
            <LinodeActionMenu
              linodeId={linodeId}
              linodeLabel={linodeLabel}
              linodeStatus={linodeStatus}
              linodeBackups={linodeBackups}
              openConfigDrawer={openConfigDrawer}
              toggleConfirmation={toggleConfirmation}
            />
          </div>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

interface WithImagesProps {
  imagesData: Linode.Image[]
}

const enhanced = compose<CombinedProps, Props>(
  styled,
  withRecentEvent,
  withDisplayType,
  withImages((ownProps, imagesData, imagesLoading) => ({
    ...ownProps,
    imagesData: imagesData.filter(i => i.is_public === true),
  })),
  hasMutationAvailable,
  withNotifications,
);

export default enhanced(LinodeRow);

export const RenderFlag: React.StatelessComponent<{
  mutationAvailable: boolean;
  linodeNotifications: Linode.Notification[],
  classes: any
}> = (props) => {
  /*
  * Render either a flag for if the Linode has a notification
  * or if it has a pending mutation available. Mutations take
  * precedent over notifications
  */
  const { mutationAvailable, linodeNotifications, classes } = props;

  if (mutationAvailable) {
    return (
      <Tooltip title="There is a free upgrade available for this Linode">
        <Flag className={classes.flag} />
      </Tooltip>
    )
  }
  if (linodeNotifications.length > 0) {
    return (
      <>
        {
          linodeNotifications.map((notification, idx) => (
            <Tooltip key={idx} title={notification.message}><Flag className={classes.flag} /></Tooltip>
          ))
        }
      </>
    );
  }
  return null;
}

RenderFlag.displayName = `RenderFlag`;
