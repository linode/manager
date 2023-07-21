import { Disk } from '@linode/api-v4/lib/linodes';
import { ResizeLinodeDiskSchema } from '@linode/validation';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { Code } from 'src/components/Code/Code';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { TextTooltip } from 'src/components/TextTooltip';
import FormHelperText from 'src/components/core/FormHelperText';
import InputAdornment from 'src/components/core/InputAdornment';
import { useEventsInfiniteQuery } from 'src/queries/events';
import {
  useAllLinodeDisksQuery,
  useLinodeDiskResizeMutation,
} from 'src/queries/linodes/disks';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { sendEvent } from 'src/utilities/analytics';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';

import { calculateDiskFree } from './CreateDiskDrawer';

const useStyles = makeStyles((theme: Theme) => ({
  formHelperTextLink: {
    display: 'block',
    marginTop: theme.spacing(1),
  },
}));

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

  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: resizeDisk, reset } = useLinodeDiskResizeMutation(
    linodeId,
    disk?.id ?? -1
  );

  const { data: disks } = useAllLinodeDisksQuery(linodeId, open);

  const { data: linode } = useLinodeQuery(linodeId, open);

  const { resetEventsPolling } = useEventsInfiniteQuery({ enabled: false });

  const maximumSize = calculateDiskFree(linode, disks, disk?.id ?? 0);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      size: disk?.size ?? maximumSize,
    },
    async onSubmit(values, helpers) {
      try {
        await resizeDisk(values);
        resetEventsPolling();
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
    <Drawer onClose={onClose} open={open} title={`Resize ${disk?.label}`}>
      <form onSubmit={formik.handleSubmit}>
        {formik.status && (
          <Notice
            error
            errorGroup="linode-disk-drawer"
            spacingBottom={8}
            text={formik.status}
          />
        )}
        <FormHelperText>
          The size of a Linode Compute Instance&rsquo;s disk can be increased or
          decreased as needed.
          <Link
            onClick={() => {
              handleLinkClick('Learn more about restrictions to keep in mind.');
            }}
            to={
              'https://www.linode.com/docs/products/compute/compute-instances/guides/disks-and-storage/'
            }
            className={classes.formHelperTextLink}
          >
            Learn more about restrictions to keep in mind.
          </Link>
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
          primaryButtonDataTestId="submit-disk-form"
          primaryButtonLoading={formik.isSubmitting}
          primaryButtonText="Resize"
          primaryButtonType="submit"
          secondaryButtonHandler={onClose}
          secondaryButtonText="Cancel"
          showPrimary
          showSecondary
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
      to="https://www.linode.com/docs/products/compute/compute-instances/guides/lish/"
    >
      Lish
    </Link>
    ).
  </>
);
