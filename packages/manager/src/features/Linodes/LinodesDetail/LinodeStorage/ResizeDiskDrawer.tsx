import { Disk } from '@linode/api-v4/lib/linodes';
import { useFormik } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Code from 'src/components/Code';
import FormHelperText from 'src/components/core/FormHelperText';
import InputAdornment from 'src/components/core/InputAdornment';
import MenuItem from 'src/components/core/MenuItem';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Drawer from 'src/components/Drawer';
import Grid from '@mui/material/Unstable_Grid2';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import TextField from 'src/components/TextField';
import { TextTooltip } from 'src/components/TextTooltip';
import { sendEvent } from 'src/utilities/ga';
import { getErrorMap } from 'src/utilities/errorUtils';
import { useSnackbar } from 'notistack';
import { calculateDiskFree } from './CreateDiskDrawer';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import {
  useAllLinodeDisksQuery,
  useLinodeDiskResizeMutation,
} from 'src/queries/linodes/disks';
import { resetEventsPolling } from 'src/eventsPolling';

const useStyles = makeStyles((theme: Theme) => ({
  formHelperTextLink: {
    display: 'block',
    marginTop: theme.spacing(1),
  },
}));

export interface Props {
  disk?: Disk;
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

  const { mutateAsync: resizeDisk, error, reset } = useLinodeDiskResizeMutation(
    linodeId,
    disk?.id ?? -1
  );

  const { data: disks } = useAllLinodeDisksQuery(linodeId, open);

  const { data: linode } = useLinodeQuery(linodeId, open);

  const maximumSize = calculateDiskFree(linode, disks, disk?.id ?? 0);

  const formik = useFormik({
    initialValues: {
      size: disk?.size ?? maximumSize,
    },
    enableReinitialize: true,
    async onSubmit(values) {
      await resizeDisk(values);
      resetEventsPolling();
      enqueueSnackbar('Successfully started resize', { variant: 'success' });
      onClose();
    },
  });

  React.useEffect(() => {
    if (open) {
      formik.resetForm();
      reset();
    }
  }, [open]);

  const errorMap = getErrorMap(['size'], error);

  return (
    <Drawer title="Resize Disk" open={open} onClose={onClose}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container direction="row">
          <Grid xs={12}>
            {errorMap.none && (
              <Notice
                error
                spacingBottom={8}
                errorGroup="linode-disk-drawer"
                text={errorMap.none}
              />
            )}
          </Grid>
          <Grid xs={12}>
            <FormHelperText>
              The size of a Linode Compute Instance&rsquo;s disk can be
              increased or decreased as needed.
              <Link
                to={
                  'https://www.linode.com/docs/products/compute/compute-instances/guides/disks-and-storage/'
                }
                onClick={() => {
                  handleLinkClick(
                    'Learn more about restrictions to keep in mind.'
                  );
                }}
                className={classes.formHelperTextLink}
              >
                Learn more about restrictions to keep in mind.
              </Link>
            </FormHelperText>
            <TextField
              disabled
              required
              label="Label"
              name="label"
              value={disk?.label}
              data-qa-label
            />
            <TextField
              disabled
              label="Filesystem"
              name="filesystem"
              select
              value={disk?.filesystem}
            >
              <MenuItem value="_none_">
                <em>Select a Filesystem</em>
              </MenuItem>
              {['raw', 'swap', 'ext3', 'ext4', 'initrd'].map((fs) => (
                <MenuItem value={fs} key={fs}>
                  {fs}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Size"
              type="number"
              name="size"
              required
              value={formik.values.size}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              errorText={errorMap.size}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">MB</InputAdornment>
                ),
              }}
              data-qa-disk-size
            />
            <FormHelperText style={{ marginTop: 8 }}>
              Maximum size: {maximumSize} MB
            </FormHelperText>
            <FormHelperText>
              Minimum size is determined by how much space the files on the disk
              are using.{' '}
              <TextTooltip
                displayText="Check disk usage."
                tooltipText={MaxSizeTooltipText}
              />
            </FormHelperText>
          </Grid>
        </Grid>
        <ActionsPanel>
          <Button
            onClick={onClose}
            buttonType="secondary"
            className="cancel"
            data-qa-disk-cancel
          >
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
