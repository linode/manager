import { Disk, LinodeType } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import Button from 'src/components/Button';
import Checkbox from 'src/components/CheckBox';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import { Dialog } from 'src/components/Dialog/Dialog';
import ExternalLink from 'src/components/ExternalLink';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';
import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';
import { resetEventsPolling } from 'src/eventsPolling';
import PlansPanel from 'src/features/Linodes/LinodesCreate/SelectPlanPanel/PlansPanel';
import { linodeInTransition } from 'src/features/Linodes/transitions';
import { getPermissionsForLinode } from 'src/store/linodes/permissions/permissions.selector';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import HostMaintenanceError from '../HostMaintenanceError';
import LinodePermissionsError from '../LinodePermissionsError';
import { extendType } from 'src/utilities/extendType';
import { useFormik } from 'formik';
import { useAllLinodeDisksQuery } from 'src/queries/linodes/disks';
import {
  useLinodeQuery,
  useLinodeResizeMutation,
} from 'src/queries/linodes/linodes';
import { useAllTypes } from 'src/queries/types';
import { useGrants } from 'src/queries/profile';
import { usePreferences } from 'src/queries/preferences';
import Box from 'src/components/core/Box';

const useStyles = makeStyles((theme: Theme) => ({
  resizeTitle: {
    display: 'flex',
    alignItems: 'center',
    minHeight: '44px',
  },
  selectPlanPanel: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(3),
    '& > div': {
      padding: 0,
    },
  },
}));

interface Props {
  linodeId?: number;
  linodeLabel?: string;
  open: boolean;
  onClose: () => void;
}

export const LinodeResize = (props: Props) => {
  const classes = useStyles();
  const { linodeId, open, onClose } = props;

  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined
  );

  const { data: disks, error: disksError } = useAllLinodeDisksQuery(
    linodeId ?? -1,
    linodeId !== undefined
  );

  const { data: types } = useAllTypes(open);

  const { data: grants } = useGrants();
  const { data: preferences } = usePreferences(open);

  const { enqueueSnackbar } = useSnackbar();

  const [confirmationText, setConfirmationText] = React.useState('');

  const {
    mutateAsync: resizeLinode,
    isLoading,
    error: resizeError,
  } = useLinodeResizeMutation(linodeId ?? -1);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      type: '',
      allow_auto_disk_resize: shouldEnableAutoResizeDiskOption(disks ?? [])[1],
    },
    async onSubmit(values) {
      const isSmaller = isSmallerThanCurrentPlan(
        values.type,
        linode?.type ?? null,
        types ?? []
      );
      /**
       * Only set the allow_auto_disk_resize flag to true if both the user
       * has selected it (this.state.autoDiskResize) and
       * the flag would be honored (so disable if the current plan
       * is larger than the target plan).
       */
      await resizeLinode({
        type: values.type,
        allow_auto_disk_resize: values.allow_auto_disk_resize && !isSmaller,
      });
      resetEventsPolling();
      enqueueSnackbar('Linode queued for resize.', {
        variant: 'info',
      });
      onClose();
    },
  });

  React.useEffect(() => {
    // Set to "block: end" since the sticky header would otherwise interfere.
    scrollErrorIntoView(undefined, { block: 'end' });
  }, [resizeError]);

  const hostMaintenance = linode?.status === 'stopped';
  const unauthorized =
    getPermissionsForLinode(grants, linodeId || 0) === 'read_only';

  const tableDisabled = hostMaintenance || unauthorized;

  const submitButtonDisabled =
    preferences?.type_to_confirm !== false &&
    confirmationText !== linode?.label;

  const type = types?.find((t) => t.id === linode?.type);

  const [
    diskToResize,
    _shouldEnableAutoResizeDiskOption,
  ] = shouldEnableAutoResizeDiskOption(disks ?? []);

  const isSmaller = isSmallerThanCurrentPlan(
    formik.values.type,
    linode?.type || '',
    types ?? []
  );

  const currentTypes =
    types?.filter((thisType) => !Boolean(thisType.successor)) ?? [];

  const error = getError(resizeError);

  return (
    <Dialog
      title={`Resize Linode ${linode?.label}`}
      open={open}
      onClose={onClose}
      fullWidth
      fullHeight
      maxWidth="md"
    >
      <form onSubmit={formik.handleSubmit}>
        {unauthorized && <LinodePermissionsError />}
        {hostMaintenance && <HostMaintenanceError />}
        {disksError && (
          <Notice
            error
            text="There was an error loading your Linode&rsquo;s Disks."
          />
        )}
        {error && <Notice error>{error}</Notice>}
        <Typography data-qa-description>
          If you&rsquo;re expecting a temporary burst of traffic to your
          website, or if you&rsquo;re not using your Linode as much as you
          thought, you can temporarily or permanently resize your Linode to a
          different plan.{' '}
          <ExternalLink
            fixedIcon
            text="Learn more."
            link="https://www.linode.com/docs/platform/disk-images/resizing-a-linode/"
          />
        </Typography>

        <div className={classes.selectPlanPanel}>
          <PlansPanel
            currentPlanHeading={type ? extendType(type).heading : undefined} // lol, why make us pass the heading and not the plan id?
            types={currentTypes.map(extendType)}
            onSelect={(type) => formik.setFieldValue('type', type)}
            selectedID={formik.values.type}
            disabled={tableDisabled}
          />
        </div>
        <Typography variant="h2" className={classes.resizeTitle}>
          Auto Resize Disk
          {disksError ? (
            <TooltipIcon
              sxTooltipIcon={{
                marginLeft: '-2px',
              }}
              text={`There was an error loading your Linode&rsquo; disks.`}
              status="help"
            />
          ) : isSmaller ? (
            <TooltipIcon
              sxTooltipIcon={{
                marginLeft: '-2px',
              }}
              text={`Your disks cannot be automatically resized when moving to a smaller plan.`}
              status="help"
            />
          ) : !_shouldEnableAutoResizeDiskOption ? (
            <TooltipIcon
              sxTooltipIcon={{
                marginLeft: '-2px',
              }}
              text={`Your ext disk can only be automatically resized if you have one ext
                    disk or one ext disk and one swap disk on this Linode.`}
              status="help"
            />
          ) : null}
        </Typography>
        <Checkbox
          disabled={!_shouldEnableAutoResizeDiskOption || isSmaller}
          checked={
            !_shouldEnableAutoResizeDiskOption || isSmaller
              ? false
              : formik.values.allow_auto_disk_resize
          }
          onChange={(value, checked) =>
            formik.setFieldValue('allow_auto_disk_resize', checked)
          }
          text={
            <Typography>
              Would you like{' '}
              {_shouldEnableAutoResizeDiskOption ? (
                <strong>{diskToResize}</strong>
              ) : (
                'your disk'
              )}{' '}
              to be automatically scaled with this Linode&rsquo;s new size? We
              recommend you keep this option enabled when available. Automatic
              resizing is only available when moving to a larger plan, and when
              you have a single ext disk (or one ext and one swap disk) on your
              Linode.
            </Typography>
          }
        />
        <Box marginTop={2}>
          <TypeToConfirm
            title="Confirm"
            confirmationText={
              <span>
                To confirm these changes, type the label of the Linode (
                <strong>{linode?.label}</strong>) in the field below:
              </span>
            }
            typographyStyle={{ marginBottom: 8 }}
            onChange={setConfirmationText}
            value={confirmationText}
            hideLabel
            visible={preferences?.type_to_confirm}
            label="Linode Label"
            textFieldStyle={{ marginBottom: 16 }}
          />
        </Box>
        <Box display="flex" justifyContent="flex-end">
          <Button
            disabled={
              !formik.values.type ||
              linodeInTransition(linode?.status || '') ||
              tableDisabled ||
              submitButtonDisabled
            }
            loading={isLoading}
            buttonType="primary"
            type="submit"
            data-qa-resize
          >
            Resize Linode
          </Button>
        </Box>
      </form>
    </Dialog>
  );
};

const getError = (error: APIError[] | null) => {
  if (!error) {
    return null;
  }

  const errorText = error?.[0]?.reason;
  if (errorText.match(/allocated more disk/i)) {
    return (
      <Typography>
        The current disk size of your Linode is too large for the new service
        plan. Please resize your disk to accommodate the new plan. You can read
        our{' '}
        <ExternalLink
          hideIcon
          text="Resize Your Linode"
          link="https://www.linode.com/docs/platform/disk-images/resizing-a-linode/"
        />{' '}
        guide for more detailed instructions.
      </Typography>
    );
  }

  return errorText;
};

/**
 * the user should only be given the option to automatically resize
 * their disks under the 2 following conditions:
 *
 * 1. They have 1 ext disk (and nothing else)
 * 2. They have 1 ext disk and 1 swap disk (and nothing else)
 *
 * If they have more than 2 disks, no automatic resizing is going to
 * take place server-side, so given them the option to toggle
 * the checkbox is pointless.
 *
 * @returns array of both the ext disk to resize and a boolean
 * of whether the option should be enabled
 */
export const shouldEnableAutoResizeDiskOption = (
  linodeDisks: Disk[]
): [string | undefined, boolean] => {
  const linodeExtDiskLabels = linodeDisks.reduce((acc, eachDisk) => {
    return eachDisk.filesystem === 'ext3' || eachDisk.filesystem === 'ext4'
      ? [...acc, eachDisk.label]
      : acc;
  }, []);
  const linodeHasOneExtDisk = linodeExtDiskLabels.length === 1;
  const linodeHasOneSwapDisk =
    linodeDisks.reduce((acc, eachDisk) => {
      return eachDisk.filesystem === 'swap'
        ? [...acc, eachDisk.filesystem]
        : acc;
    }, []).length === 1;
  const shouldEnable =
    (linodeDisks.length === 1 && linodeHasOneExtDisk) ||
    (linodeDisks.length === 2 && linodeHasOneSwapDisk && linodeHasOneExtDisk);
  return [linodeExtDiskLabels[0], shouldEnable];
};

export const isSmallerThanCurrentPlan = (
  selectedPlanID: string | null,
  currentPlanID: string | null,
  types: LinodeType[]
) => {
  const currentType = types.find((thisType) => thisType.id === currentPlanID);
  const nextType = types.find((thisType) => thisType.id === selectedPlanID);

  if (!(currentType && nextType)) {
    return false;
  }

  return currentType.disk > nextType.disk;
};
