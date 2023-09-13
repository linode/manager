import { Disk, LinodeType } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Checkbox } from 'src/components/Checkbox';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';
import { Typography } from 'src/components/Typography';
import { resetEventsPolling } from 'src/eventsPolling';
import { linodeInTransition } from 'src/features/Linodes/transitions';
import { PlansPanel } from 'src/features/components/PlansPanel/PlansPanel';
import { useAllLinodeDisksQuery } from 'src/queries/linodes/disks';
import {
  useLinodeQuery,
  useLinodeResizeMutation,
} from 'src/queries/linodes/linodes';
import { usePreferences } from 'src/queries/preferences';
import { useGrants } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';
import { useAllTypes } from 'src/queries/types';
import { extendType } from 'src/utilities/extendType';
import { getPermissionsForLinode } from 'src/utilities/linodes';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import { HostMaintenanceError } from '../HostMaintenanceError';
import { LinodePermissionsError } from '../LinodePermissionsError';

interface Props {
  linodeId?: number;
  linodeLabel?: string;
  onClose: () => void;
  open: boolean;
}

export const LinodeResize = (props: Props) => {
  const { linodeId, onClose, open } = props;

  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined && open
  );

  const { data: disks, error: disksError } = useAllLinodeDisksQuery(
    linodeId ?? -1,
    linodeId !== undefined && open
  );

  const { data: types } = useAllTypes(open);

  const { data: grants } = useGrants();
  const { data: preferences } = usePreferences(open);

  const { enqueueSnackbar } = useSnackbar();

  const [confirmationText, setConfirmationText] = React.useState('');

  const {
    error: resizeError,
    isLoading,
    mutateAsync: resizeLinode,
  } = useLinodeResizeMutation(linodeId ?? -1);

  const { data: regionsData } = useRegionsQuery();

  const formik = useFormik({
    initialValues: {
      allow_auto_disk_resize: shouldEnableAutoResizeDiskOption(disks ?? [])[1],
      type: '',
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
        allow_auto_disk_resize: values.allow_auto_disk_resize && !isSmaller,
        type: values.type,
      });
      resetEventsPolling();
      enqueueSnackbar('Linode queued for resize.', {
        variant: 'info',
      });
      onClose();
    },
  });

  React.useEffect(() => {
    const allow_auto_disk_resize = shouldEnableAutoResizeDiskOption(
      disks ?? []
    )[1];

    if (allow_auto_disk_resize !== formik.values.allow_auto_disk_resize) {
      formik.setFieldValue('allow_auto_disk_resize', allow_auto_disk_resize);
    }
  }, [disks]);

  React.useEffect(() => {
    if (!open) {
      formik.resetForm();
      setConfirmationText('');
    }
  }, [open]);

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
      fullHeight
      fullWidth
      maxWidth="md"
      onClose={onClose}
      open={open}
      title={`Resize Linode ${linode?.label}`}
    >
      <form onSubmit={formik.handleSubmit}>
        {unauthorized && <LinodePermissionsError />}
        {hostMaintenance && <HostMaintenanceError />}
        {disksError && (
          <Notice
            text="There was an error loading your Linode&rsquo;s Disks."
            variant="error"
          />
        )}
        {error && <Notice variant="error">{error}</Notice>}
        <Typography data-qa-description>
          If you&rsquo;re expecting a temporary burst of traffic to your
          website, or if you&rsquo;re not using your Linode as much as you
          thought, you can temporarily or permanently resize your Linode to a
          different plan.{' '}
          <Link to="https://www.linode.com/docs/platform/disk-images/resizing-a-linode/">
            Learn more.
          </Link>
        </Typography>

        <StyledDiv>
          <PlansPanel
            currentPlanHeading={type ? extendType(type).heading : undefined} // lol, why make us pass the heading and not the plan id?
            disabled={tableDisabled}
            onSelect={(type) => formik.setFieldValue('type', type)}
            regionsData={regionsData}
            selectedID={formik.values.type}
            selectedRegionID={linode?.region}
            types={currentTypes.map(extendType)}
          />
        </StyledDiv>
        <Typography
          sx={{ alignItems: 'center', display: 'flex', minHeight: '44px' }}
          variant="h2"
        >
          Auto Resize Disk
          {disksError ? (
            <TooltipIcon
              sxTooltipIcon={{
                marginLeft: '-2px',
              }}
              status="help"
              text={`There was an error loading your Linode&rsquo; disks.`}
            />
          ) : isSmaller ? (
            <TooltipIcon
              sxTooltipIcon={{
                marginLeft: '-2px',
              }}
              status="help"
              text={`Your disks cannot be automatically resized when moving to a smaller plan.`}
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
          disabled={!_shouldEnableAutoResizeDiskOption || isSmaller}
        />
        <Box marginTop={2}>
          <TypeToConfirm
            confirmationText={
              <span>
                To confirm these changes, type the label of the Linode (
                <strong>{linode?.label}</strong>) in the field below:
              </span>
            }
            hideLabel
            label="Linode Label"
            onChange={setConfirmationText}
            textFieldStyle={{ marginBottom: 16 }}
            title="Confirm"
            typographyStyle={{ marginBottom: 8 }}
            value={confirmationText}
            visible={preferences?.type_to_confirm}
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
            buttonType="primary"
            data-qa-resize
            loading={isLoading}
            type="submit"
          >
            Resize Linode
          </Button>
        </Box>
      </form>
    </Dialog>
  );
};

const StyledDiv = styled('div', { label: 'StyledDiv' })(({ theme }) => ({
  '& > div': {
    padding: 0,
  },
  marginBottom: theme.spacing(3),
  marginTop: theme.spacing(5),
}));

const getError = (error: APIError[] | null) => {
  if (!error) {
    return null;
  }

  const errorText = error?.[0]?.reason;
  if (
    typeof errorText === 'string' &&
    errorText.match(/allocated more disk/i)
  ) {
    return (
      <Typography>
        The current disk size of your Linode is too large for the new service
        plan. Please resize your disk to accommodate the new plan. You can read
        our{' '}
        <Link to="https://www.linode.com/docs/platform/disk-images/resizing-a-linode/">
          Resize Your Linode
        </Link>{' '}
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
  selectedPlanID: null | string,
  currentPlanID: null | string,
  types: LinodeType[]
) => {
  const currentType = types.find((thisType) => thisType.id === currentPlanID);
  const nextType = types.find((thisType) => thisType.id === selectedPlanID);

  if (!(currentType && nextType)) {
    return false;
  }

  return currentType.disk > nextType.disk;
};
