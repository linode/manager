import {
  useAllLinodeDisksQuery,
  useLinodeDiskResizeMutation,
  useLinodeQuery,
} from '@linode/queries';
import {
  ActionsPanel,
  Drawer,
  FormHelperText,
  InputAdornment,
  Notice,
  TextField,
} from '@linode/ui';
import { ResizeLinodeDiskSchema } from '@linode/validation';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Code } from 'src/components/Code/Code';
import { Link } from 'src/components/Link';
import { NotFound } from 'src/components/NotFound';
import { TextTooltip } from 'src/components/TextTooltip';
import { useEventsPollingActions } from 'src/queries/events/events';
import { sendEvent } from 'src/utilities/analytics/utils';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';

import { calculateDiskFree } from './CreateDiskDrawer';

import type { Disk } from '@linode/api-v4/lib/linodes';

export interface Props {
  disk: Disk | undefined;
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

const handleLinkClick = (label: string) => {
  sendEvent({
    action: `Click:link`,
    category: 'Disk Resize Flow',
    label,
  });
};

export const ResizeDiskDrawer = (props: Props) => {
  const { disk, linodeId, onClose, open } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { checkForNewEvents } = useEventsPollingActions();

  const { mutateAsync: resizeDisk, reset } = useLinodeDiskResizeMutation(
    linodeId,
    disk?.id ?? -1
  );

  const { data: disks } = useAllLinodeDisksQuery(linodeId, open);

  const { data: linode } = useLinodeQuery(linodeId, open);

  const maximumSize = calculateDiskFree(linode, disks, disk?.id ?? 0);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      size: disk?.size ?? maximumSize,
    },
    async onSubmit(values, helpers) {
      try {
        await resizeDisk(values);
        checkForNewEvents();
        enqueueSnackbar('Disk queued for resizing.', { variant: 'success' });
        onClose();
      } catch (e) {
        handleAPIErrors(e, helpers.setFieldError, helpers.setStatus);
      }
    },
    validateOnChange: true,
    validationSchema: ResizeLinodeDiskSchema,
  });

  React.useEffect(() => {
    if (open) {
      formik.resetForm();
      reset();
    }
  }, [open]);

  return (
    <Drawer
      NotFoundComponent={NotFound}
      onClose={onClose}
      open={open}
      title={`Resize ${disk?.label}`}
    >
      <form onSubmit={formik.handleSubmit}>
        {formik.status && (
          <Notice
            errorGroup="linode-disk-drawer"
            spacingBottom={8}
            text={formik.status}
            variant="error"
          />
        )}
        <FormHelperText>
          The size of a Linode Compute Instance&rsquo;s disk can be increased or
          decreased as needed.
          <StyledLink
            onClick={() => {
              handleLinkClick('Learn more about restrictions to keep in mind.');
            }}
            to={
              'https://techdocs.akamai.com/cloud-computing/docs/manage-disks-on-a-compute-instance'
            }
          >
            Learn more about restrictions to keep in mind.
          </StyledLink>
        </FormHelperText>
        <TextField
          InputProps={{
            endAdornment: <InputAdornment position="end">MB</InputAdornment>,
          }}
          aria-required
          data-qa-disk-size
          errorText={formik.errors.size}
          label="Size"
          name="size"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          required
          type="number"
          value={formik.values.size}
        />
        <FormHelperText style={{ marginTop: 8 }}>
          Maximum size: {maximumSize} MB
        </FormHelperText>
        <FormHelperText>
          Minimum size is determined by how much space the files on the disk are
          using.{' '}
          <TextTooltip
            displayText="Check disk usage."
            tooltipText={MaxSizeTooltipText}
          />
        </FormHelperText>
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit-disk-form',
            label: 'Resize',
            loading: formik.isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      </form>
    </Drawer>
  );
};

const MaxSizeTooltipText = (
  <>
    Run the command <Code>df -h</Code> within the Linode&rsquo;s command line
    (through{' '}
    <Link
      onClick={() => {
        handleLinkClick('SSH');
      }}
      to="https://www.linode.com/docs/guides/connect-to-server-over-ssh/"
    >
      SSH
    </Link>{' '}
    or{' '}
    <Link
      onClick={() => {
        handleLinkClick('Lish');
      }}
      to="https://techdocs.akamai.com/cloud-computing/docs/access-your-system-console-using-lish"
    >
      Lish
    </Link>
    ).
  </>
);

const StyledLink = styled(Link, { label: 'StyledLink' })(({ theme }) => ({
  display: 'block',
  marginTop: theme.spacing(1),
}));
