import { useGrants, useProfile } from '@linode/queries';
import { ActionsPanel, Drawer, Notice, TextField } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import { useFormik } from 'formik';
import * as React from 'react';

import { NotFound } from 'src/components/NotFound';
import { useImportZoneMutation } from 'src/queries/domains';
import { getErrorMap } from 'src/utilities/errorUtils';

import type { ImportZonePayload } from '@linode/api-v4/lib/domains';

interface DomainZoneImportDrawerProps {
  onClose: () => void;
  open: boolean;
}

export const DomainZoneImportDrawer = (props: DomainZoneImportDrawerProps) => {
  const { onClose: _onClose, open } = props;
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const navigate = useNavigate();

  const { error, mutateAsync: importZone, reset } = useImportZoneMutation();

  const formik = useFormik<ImportZonePayload>({
    initialValues: {
      domain: '',
      remote_nameserver: '',
    },
    onSubmit: async (values) => {
      const result = await importZone(values);
      navigate({
        params: { domainId: result.id },
        to: '/domains/$domainId',
      });
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
    <Drawer
      NotFoundComponent={NotFound}
      onClose={onClose}
      open={open}
      title="Import a Zone"
    >
      {noPermission && (
        <Notice variant="error">
          You do not have permission to create new Domains.
        </Notice>
      )}
      <form onSubmit={formik.handleSubmit}>
        {generalError && <Notice text={generalError} variant="error" />}
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
        <ActionsPanel
          primaryButtonProps={{
            disabled: !formik.dirty,
            label: 'Import',
            loading: formik.isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      </form>
    </Drawer>
  );
};
