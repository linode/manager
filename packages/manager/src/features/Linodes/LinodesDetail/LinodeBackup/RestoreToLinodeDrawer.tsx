import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import CheckBox from 'src/components/CheckBox';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import FormHelperText from 'src/components/core/FormHelperText';
import Drawer from 'src/components/Drawer';
import Select from 'src/components/EnhancedSelect/Select';
import { Notice } from 'src/components/Notice/Notice';
import { useFormik } from 'formik';
import { LinodeBackup } from '@linode/api-v4/lib/linodes';
import { useSnackbar } from 'notistack';
import { resetEventsPolling } from 'src/eventsPolling';
import { getErrorMap } from 'src/utilities/errorUtils';
import { useLinodeBackupRestoreMutation } from 'src/queries/linodes/backups';
import {
  useAllLinodesQuery,
  useLinodeQuery,
} from 'src/queries/linodes/linodes';

interface Props {
  open: boolean;
  linodeId: number;
  backup: LinodeBackup | undefined;
  onClose: () => void;
}

export const RestoreToLinodeDrawer = (props: Props) => {
  const { linodeId, backup, open, onClose } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { data: linode } = useLinodeQuery(linodeId, open);

  const {
    data: linodes,
    isLoading: linodesLoading,
    error: linodeError,
  } = useAllLinodesQuery(
    {},
    {
      region: linode?.region,
    },
    open && linode !== undefined
  );

  const {
    mutateAsync: restoreBackup,
    error,
    isLoading,
    reset: resetMutation,
  } = useLinodeBackupRestoreMutation();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      overwrite: false,
      linode_id: linodeId,
    },
    async onSubmit(values) {
      await restoreBackup({
        linodeId,
        backupId: backup?.id ?? -1,
        targetLinodeId: values.linode_id ?? -1,
        overwrite: values.overwrite,
      });
      enqueueSnackbar(
        `Started restoring Linode ${selectedLinodeOption?.label} from a backup`,
        { variant: 'info' }
      );
      resetEventsPolling();
      onClose();
    },
  });

  React.useEffect(() => {
    if (open) {
      formik.resetForm();
      resetMutation();
    }
  }, [open]);

  const linodeOptions =
    linodes?.map(({ label, id }) => {
      return { label, value: id };
    }) ?? [];

  const selectedLinodeOption = linodeOptions.find(
    (option) => option.value === formik.values.linode_id
  );

  const errorMap = getErrorMap(['linode_id', 'overwrite'], error);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Restore Backup from ${backup?.created}`}
    >
      <form onSubmit={formik.handleSubmit}>
        {Boolean(errorMap.none) && <Notice error>{errorMap.none}</Notice>}
        <Select
          textFieldProps={{
            dataAttrs: {
              'data-qa-select-linode': true,
            },
          }}
          value={selectedLinodeOption}
          options={linodeOptions}
          onChange={(item) => formik.setFieldValue('linode_id', item.value)}
          errorText={linodeError?.[0].reason ?? errorMap.linode_id}
          placeholder="Select a Linode"
          label="Linode"
          isClearable={false}
          isLoading={linodesLoading}
        />
        <FormControl sx={{ paddingLeft: 0.4 }}>
          <FormControlLabel
            label="Overwrite Linode"
            control={
              <CheckBox
                name="overwrite"
                checked={formik.values.overwrite}
                onChange={formik.handleChange}
              />
            }
          />
          <FormHelperText sx={{ marginLeft: 0 }}>
            Overwriting will delete all disks and configs on the target Linode
            before restoring
          </FormHelperText>
        </FormControl>
        {Boolean(errorMap.overwrite) && (
          <Notice error>{errorMap.overwrite}</Notice>
        )}
        {formik.values.overwrite && (
          <Notice
            spacingTop={12}
            spacingBottom={0}
            warning
            text={`This will delete all disks and configs on ${
              selectedLinodeOption
                ? `Linode ${selectedLinodeOption.label}`
                : 'the selcted Linode'
            }`}
          />
        )}
        <ActionsPanel>
          <Button
            buttonType="secondary"
            onClick={onClose}
            data-qa-restore-cancel
          >
            Cancel
          </Button>
          <Button
            buttonType="primary"
            type="submit"
            loading={isLoading}
            data-qa-restore-submit
          >
            Restore
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};
