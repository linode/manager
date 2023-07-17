import { ImportZonePayload } from '@linode/api-v4/lib/domains';
import { useFormik } from 'formik';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import Drawer from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { useImportZoneMutation } from 'src/queries/domains';
import { useGrants, useProfile } from 'src/queries/profile';
import { getErrorMap } from 'src/utilities/errorUtils';

interface Props {
  onClose: () => void;
  open: boolean;
}

const DomainZoneImportDrawer = (props: Props) => {
  const { onClose: _onClose, open } = props;
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const history = useHistory();

  const { error, mutateAsync: importZone, reset } = useImportZoneMutation();

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
    <Drawer onClose={onClose} open={open} title="Import a Zone">
      {noPermission && (
        <Notice error>You do not have permission to create new Domains.</Notice>
      )}
      <form onSubmit={formik.handleSubmit}>
        {generalError && <Notice error text={generalError} />}
        <TextField
          disabled={noPermission}
          errorText={domainError}
          id="domain"
          label="Domain"
          name="domain"
          onChange={formik.handleChange}
          value={formik.values.domain}
        />
        <TextField
          disabled={noPermission}
          errorText={remoteNameserverError}
          id="remote_nameserver"
          label="Remote Nameserver"
          name="remote_nameserver"
          onChange={formik.handleChange}
          value={formik.values.remote_nameserver}
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
