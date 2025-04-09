import {
  Box,
  Button,
  Checkbox,
  CircleProgress,
  Dialog,
  Divider,
  Notice,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import { scrollErrorIntoViewV2 } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { Link } from 'src/components/Link';
import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';
import { PlansPanel } from 'src/features/components/PlansPanel/PlansPanel';
import { linodeInTransition } from 'src/features/Linodes/transitions';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useEventsPollingActions } from 'src/queries/events/events';
import {
  useAllLinodeDisksQuery,
  useLinodeQuery,
  useLinodeResizeMutation,
  usePreferences,
  useRegionsQuery,
} from '@linode/queries';
import { useAllTypes } from 'src/queries/types';
import { extendType } from 'src/utilities/extendType';

import { HostMaintenanceError } from '../HostMaintenanceError';
import { LinodePermissionsError } from '../LinodePermissionsError';
import {
  isSmallerThanCurrentPlan,
  shouldEnableAutoResizeDiskOption,
} from './LinodeResize.utils';
import { UnifiedMigrationPanel } from './LinodeResizeUnifiedMigrationPanel';

import type {
  MigrationTypes,
  ResizeLinodePayload,
} from '@linode/api-v4/lib/linodes';

export interface Props {
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
  const { linodeId, linodeLabel, onClose, open } = props;
  const theme = useTheme();

  const { data: linode, isLoading: isLinodeDataLoading } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined && open
  );

  const { data: disks, error: disksError } = useAllLinodeDisksQuery(
    linodeId ?? -1,
    linodeId !== undefined && open
  );

  const { data: types } = useAllTypes(open);

  const { data: typeToConfirmPreference } = usePreferences(
    (preferences) => preferences?.type_to_confirm ?? true,
    open
  );

  const { enqueueSnackbar } = useSnackbar();
  const [confirmationText, setConfirmationText] = React.useState('');
  const [resizeError, setResizeError] = React.useState<string>('');
  const formRef = React.useRef<HTMLFormElement>(null);

  const {
    error,
    isPending,
    mutateAsync: resizeLinode,
  } = useLinodeResizeMutation(linodeId ?? -1);

  const { checkForNewEvents } = useEventsPollingActions();

  const { data: regionsData } = useRegionsQuery();

  const hostMaintenance = linode?.status === 'stopped';
  const isLinodeOffline = linode?.status === 'offline';

  const isLinodesGrantReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'linode',
    id: linodeId,
  });

  const formik = useFormik<ResizeLinodePayload>({
    initialValues: {
      allow_auto_disk_resize: shouldEnableAutoResizeDiskOption(disks ?? [])[1],
      migration_type: migrationTypeOptions.warm,
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
        migration_type: values.migration_type,
        type: values.type,
      });
      checkForNewEvents();
      enqueueSnackbar('Linode queued for resize.', {
        variant: 'info',
      });
      onClose();
    },
    validate: () => scrollErrorIntoViewV2(formRef),
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
      setResizeError('');
    }
  }, [open]);

  React.useEffect(() => {
    if (error) {
      setResizeError(error?.[0]?.reason);
    }
  }, [error]);

  const tableDisabled = hostMaintenance || isLinodesGrantReadOnly;

  const submitButtonDisabled =
    Boolean(typeToConfirmPreference) && confirmationText !== linode?.label;

  const type = types?.find((t) => t.id === linode?.type);

  const [diskToResize, _shouldEnableAutoResizeDiskOption] =
    shouldEnableAutoResizeDiskOption(disks ?? []);

  const isSmaller = isSmallerThanCurrentPlan(
    formik.values.type,
    linode?.type || '',
    types ?? []
  );

  const currentTypes =
    types?.filter((thisType) => !Boolean(thisType.successor)) ?? [];

  return (
    <Dialog
      fullHeight
      fullWidth
      maxWidth="md"
      onClose={onClose}
      open={open}
      title={`Resize Linode ${linodeLabel ?? ''}`}
    >
      {isLinodeDataLoading ? (
        <CircleProgress />
      ) : (
        <form onSubmit={formik.handleSubmit} ref={formRef}>
          {isLinodesGrantReadOnly && <LinodePermissionsError />}
          {hostMaintenance && <HostMaintenanceError />}
          {disksError && (
            <Notice
              text="There was an error loading your Linode&rsquo;s Disks."
              variant="error"
            />
          )}
          {resizeError && (
            <Notice variant="error">
              <ErrorMessage
                entity={{
                  id: linodeId,
                  type: 'linode_id',
                }}
                message={resizeError}
              />
            </Notice>
          )}
          <Typography data-qa-description>
            If you&rsquo;re expecting a temporary burst of traffic to your
            website, or if you&rsquo;re not using your Linode as much as you
            thought, you can temporarily or permanently resize your Linode to a
            different plan.{' '}
            <Link to="https://techdocs.akamai.com/cloud-computing/docs/resize-a-compute-instance">
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
          <UnifiedMigrationPanel
            formik={formik}
            isLinodeOffline={isLinodeOffline}
            migrationTypeOptions={migrationTypeOptions}
          />
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
              visible={typeToConfirmPreference}
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
              loading={isPending}
              type="submit"
            >
              Resize Linode
            </Button>
          </Box>
        </form>
      )}
    </Dialog>
  );
};
