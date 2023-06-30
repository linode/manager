import { Disk } from '@linode/api-v4/lib/linodes';
import { useFormik } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { Code } from 'src/components/Code/Code';
import FormHelperText from 'src/components/core/FormHelperText';
import InputAdornment from 'src/components/core/InputAdornment';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Drawer from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { TextTooltip } from 'src/components/TextTooltip';
import { sendEvent } from 'src/utilities/analytics';
import { useSnackbar } from 'notistack';
import { calculateDiskFree } from './CreateDiskDrawer';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import {
  useAllLinodeDisksQuery,
  useLinodeDiskResizeMutation,
} from 'src/queries/linodes/disks';
import { ResizeLinodeDiskSchema } from '@linode/validation';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';
import { useEventsInfiniteQuery } from 'src/queries/events';

const useStyles = makeStyles((theme: Theme) => ({
  formHelperTextLink: {
    display: 'block',
    marginTop: theme.spacing(1),
  },
}));

export interface Props {
  disk: Disk | undefined;
  open: boolean;
  onClose: () => void;
  linodeId: number;
}

const handleLinkClick = (label: string) => {
  sendEvent({
    category: 'Disk Resize Flow',
    action: `Click:link`,
    label,
  });
};

export const ResizeDiskDrawer = (props: Props) => {
  const { disk, open, onClose, linodeId } = props;

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
    initialValues: {
      size: disk?.size ?? maximumSize,
    },
    validationSchema: ResizeLinodeDiskSchema,
    validateOnChange: true,
    enableReinitialize: true,
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
  });

  React.useEffect(() => {
    if (open) {
      formik.resetForm();
      reset();
    }
  }, [open]);

  return (
    <Drawer title={`Resize ${disk?.label}`} open={open} onClose={onClose}>
      <form onSubmit={formik.handleSubmit}>
        {formik.status && (
          <Notice
            error
            spacingBottom={8}
            errorGroup="linode-disk-drawer"
            text={formik.status}
          />
        )}
        <FormHelperText>
          The size of a Linode Compute Instance&rsquo;s disk can be increased or
          decreased as needed.
          <Link
            to={
              'https://www.linode.com/docs/products/compute/compute-instances/guides/disks-and-storage/'
            }
            onClick={() => {
              handleLinkClick('Learn more about restrictions to keep in mind.');
            }}
            className={classes.formHelperTextLink}
          >
            Learn more about restrictions to keep in mind.
          </Link>
        </FormHelperText>
        <TextField
          required
          aria-required
          label="Size"
          type="number"
          name="size"
          value={formik.values.size}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          errorText={formik.errors.size}
          InputProps={{
            endAdornment: <InputAdornment position="end">MB</InputAdornment>,
          }}
          data-qa-disk-size
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
        <ActionsPanel>
          <Button onClick={onClose} buttonType="secondary" className="cancel">
            Cancel
          </Button>
          <Button
            type="submit"
            buttonType="primary"
            loading={formik.isSubmitting}
            data-testid="submit-disk-form"
          >
            Resize
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};

const MaxSizeTooltipText = (
  <>
    Run the command <Code>df -h</Code> within the Linode&rsquo;s command line
    (through{' '}
    <Link
      to="https://www.linode.com/docs/guides/connect-to-server-over-ssh/"
      onClick={() => {
        handleLinkClick('SSH');
      }}
    >
      SSH
    </Link>{' '}
    or{' '}
    <Link
      to="https://www.linode.com/docs/products/compute/compute-instances/guides/lish/"
      onClick={() => {
        handleLinkClick('Lish');
      }}
    >
      Lish
    </Link>
    ).
  </>
);
