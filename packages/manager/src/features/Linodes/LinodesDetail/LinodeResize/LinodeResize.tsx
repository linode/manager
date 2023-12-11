import {
  MigrationTypes,
  ResizeLinodePayload,
} from '@linode/api-v4/lib/linodes';
import { useTheme } from '@mui/material/styles';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Checkbox } from 'src/components/Checkbox';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Divider } from 'src/components/Divider';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';
import { Typography } from 'src/components/Typography';
import { resetEventsPolling } from 'src/eventsPolling';
import { linodeInTransition } from 'src/features/Linodes/transitions';
import { PlansPanel } from 'src/features/components/PlansPanel/PlansPanel';
import { useFlags } from 'src/hooks/useFlags';
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
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import { HostMaintenanceError } from '../HostMaintenanceError';
import { LinodePermissionsError } from '../LinodePermissionsError';
import {
  getError,
  isSmallerThanCurrentPlan,
  shouldEnableAutoResizeDiskOption,
} from './LinodeResize.utils';
import { UnifiedMigrationPanel } from './LinodeResizeUnifiedMigrationPanel';

import type { ButtonProps } from 'src/components/Button/Button';

interface Props {
  linodeId?: number;
  linodeLabel?: string;
  onClose: () => void;
  open: boolean;
}

const migrationTypeOptions: { [key in MigrationTypes]: key } = {
  cold: 'cold',
  warm: 'warm',
};

export const LinodeResize = (props: Props) => {
  const { linodeId, onClose, open } = props;
  const flags = useFlags();
  const theme = useTheme();

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

  const [hasResizeError, setHasResizeError] = React.useState<boolean>(false);

  const {
    error: resizeError,
    isLoading,
    mutateAsync: resizeLinode,
  } = useLinodeResizeMutation(linodeId ?? -1);

  const { data: regionsData } = useRegionsQuery();

  const hostMaintenance = linode?.status === 'stopped';
  const isLinodeOffline = linode?.status === 'offline';
  const unauthorized =
    getPermissionsForLinode(grants, linodeId || 0) === 'read_only';

  const formik = useFormik<ResizeLinodePayload>({
    initialValues: {
      allow_auto_disk_resize: shouldEnableAutoResizeDiskOption(disks ?? [])[1],
      migration_type: flags.unifiedMigrations
        ? migrationTypeOptions.warm
        : undefined,
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
        migration_type: flags.unifiedMigrations
          ? values.migration_type
          : undefined,
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
    if (isLinodeOffline) {
      formik.setFieldValue('migration_type', migrationTypeOptions.cold);
    }
  }, [isLinodeOffline, open]);

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
      setHasResizeError(false);
    }
  }, [open]);

  React.useEffect(() => {
    if (resizeError) {
      setHasResizeError(true);
      // Set to "block: end" since the sticky header would otherwise interfere.
      scrollErrorIntoView(undefined, { block: 'end' });
    }
  }, [resizeError]);

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

  const resizeButtonProps: ButtonProps =
    flags.unifiedMigrations &&
    formik.values.migration_type === 'warm' &&
    !isLinodeOffline
      ? {
          onClick: () => formik.handleSubmit(),
        }
      : {
          loading: isLoading,
          type: 'submit',
        };

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
        {hasResizeError && <Notice variant="error">{error}</Notice>}
        <Typography data-qa-description>
          If you&rsquo;re expecting a temporary burst of traffic to your
          website, or if you&rsquo;re not using your Linode as much as you
          thought, you can temporarily or permanently resize your Linode to a
          different plan.{' '}
          <Link to="https://www.linode.com/docs/platform/disk-images/resizing-a-linode/">
            Learn more.
          </Link>
        </Typography>

        <Box
          sx={{
            '& > div': {
              padding: 0,
            },
            marginBottom: theme.spacing(3),
            marginTop: theme.spacing(5),
          }}
        >
          <PlansPanel
            currentPlanHeading={type ? extendType(type).heading : undefined} // lol, why make us pass the heading and not the plan id?
            disabled={tableDisabled}
            onSelect={(type) => formik.setFieldValue('type', type)}
            regionsData={regionsData}
            selectedId={formik.values.type}
            selectedRegionID={linode?.region}
            types={currentTypes.map(extendType)}
          />
        </Box>

        {flags.unifiedMigrations && (
          <UnifiedMigrationPanel
            formik={formik}
            isLinodeOffline={isLinodeOffline}
            migrationTypeOptions={migrationTypeOptions}
          />
        )}
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
              to be automatically scaled with this Linode&rsquo;s new size?{' '}
              <br />
              We recommend you keep this option enabled when available.
            </Typography>
          }
          disabled={!_shouldEnableAutoResizeDiskOption || isSmaller}
        />
        <Divider
          sx={{
            marginTop: theme.spacing(2),
          }}
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
            {...resizeButtonProps}
          >
            Resize Linode
          </Button>
        </Box>
      </form>
    </Dialog>
  );
};
