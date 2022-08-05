import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { ImportZonePayload } from '@linode/api-v4/lib/domains';
import { useFormik } from 'formik';
import { useHistory } from 'react-router-dom';
import { useImportZoneMutation } from 'src/queries/domains';
import { getErrorMap } from 'src/utilities/errorUtils';
import { useProfile, useGrants } from 'src/queries/profile';

interface Props {
  open: boolean;
  onClose: () => void;
}

const DomainZoneImportDrawer = (props: Props) => {
  const { open, onClose: _onClose } = props;
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const history = useHistory();

  const { mutateAsync: importZone, error, reset } = useImportZoneMutation();

  const formik = useFormik<ImportZonePayload>({
    initialValues: {
      domain: '',
      remote_nameserver: '',
    },
    onSubmit: async (values) => {
      const result = await importZone(values);
      history.push(`/domains/${result.id}`);
    },
  });

  const onClose = () => {
    _onClose();
    formik.resetForm();
    reset();
  };

  const errorMap = getErrorMap(['domain', 'remote_nameserver'], error);

  const generalError = errorMap.none;
  const domainError = errorMap.domain;
  const remoteNameserverError = errorMap.remote_nameserver;

  const noPermission = profile?.restricted && !grants?.global.add_domains;

  return (
    <Drawer open={open} onClose={onClose} title="Import a Zone">
      {noPermission && (
        <Notice error>You do not have permission to create new Domains.</Notice>
      )}
      <form onSubmit={formik.handleSubmit}>
        {generalError && <Notice error text={generalError} />}
        <TextField
          label="Domain"
          id="domain"
          name="domain"
          onChange={formik.handleChange}
          value={formik.values.domain}
          errorText={domainError}
          disabled={noPermission}
        />
        <TextField
          label="Remote Nameserver"
          id="remote_nameserver"
          name="remote_nameserver"
          onChange={formik.handleChange}
          value={formik.values.remote_nameserver}
          errorText={remoteNameserverError}
          disabled={noPermission}
        />
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            disabled={!formik.dirty}
            loading={formik.isSubmitting}
            type="submit"
          >
            Import
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};

export default DomainZoneImportDrawer;
