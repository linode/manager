import { ManagedLinodeSetting } from '@linode/api-v4/lib/managed';
import Grid from '@mui/material/Unstable_Grid2';
import { Formik, FormikHelpers } from 'formik';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { IPSelect } from 'src/components/IPSelect/IPSelect';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Toggle } from 'src/components/Toggle/Toggle';
import { useUpdateLinodeSettingsMutation } from 'src/queries/managed/managed';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { privateIPRegex, removePrefixLength } from 'src/utilities/ipUtils';

import {
  StyledIPGrid,
  StyledPortGrid,
  StyledTypography,
} from './EditSSHAccessDrawer.styles';
import { DEFAULTS } from './common';

interface EditSSHAccessDrawerProps {
  closeDrawer: () => void;
  isOpen: boolean;
  linodeSetting?: ManagedLinodeSetting;
}

const EditSSHAccessDrawer = (props: EditSSHAccessDrawerProps) => {
  const { closeDrawer, isOpen, linodeSetting } = props;

  const { mutateAsync: updateLinodeSettings } = useUpdateLinodeSettingsMutation(
    linodeSetting?.id || -1
  );

  const title = linodeSetting
    ? `Edit SSH Access for ${linodeSetting.label}`
    : 'Edit SSH Access';

  const onSubmit = (
    values: Omit<ManagedLinodeSetting, 'group' | 'id' | 'label'>,
    { setErrors, setStatus, setSubmitting }: FormikHelpers<ManagedLinodeSetting>
  ) => {
    // It probably isn't possible to end up here without linodeSetting,
    // but we'll include an early return to make TypeScript happy.
    if (!linodeSetting) {
      return;
    }
    setStatus(undefined);

    // If the user has blanked out these fields, exchange in the defaults
    // for `user` and `port`. We could also choose to NOT send these to
    // the API to update, but this effectively achieves the same thing.
    const user = values.ssh.user !== '' ? values.ssh.user : DEFAULTS.user;
    const port =
      String(values.ssh.port) !== '' ? values.ssh.port : DEFAULTS.port;

    updateLinodeSettings({
      ssh: { ...values.ssh, port, user },
    })
      .then(() => {
        setSubmitting(false);
        closeDrawer();
      })
      .catch((err) => {
        setSubmitting(false);
        const defaultMessage = `Unable to update SSH Access for this Linode. Please try again later.`;
        const mapErrorToStatus = (generalError: string) =>
          setStatus({ generalError });

        handleFieldErrors(setErrors, err);
        handleGeneralErrors(mapErrorToStatus, err, defaultMessage);
      });
  };

  return (
    <Drawer onClose={closeDrawer} open={isOpen} title={title}>
      {!linodeSetting ? null : (
        <>
          {/* We're intentionally not validating with Formik, because we want to allow "Port" to
          be transformed before submit. I tried a few different things that were unsatisfactory, and
          since the services library validates the request anyway, this is what I went with. */}
          <Formik
            initialValues={{
              // These values are nested this way to mach the API request/response.
              ssh: {
                access: linodeSetting.ssh.access,
                ip: linodeSetting.ssh.ip,
                port: linodeSetting.ssh.port,
                user: linodeSetting.ssh.user,
              },
            }}
            onSubmit={onSubmit}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              setFieldValue,
              status,
              values,
            }) => {
              const { access, ip, port, user } = values.ssh;

              const userError = errors['ssh.user'];

              // API oddity: IP errors come back as {field: 'ip'} instead of {field: 'ssh.ip'} liked we'd expect.
              // tslint:disable-next-line
              const ipError = errors['ssh.ip'] || errors['ip'];

              const portError = errors['ssh.port'];

              return (
                <>
                  {status && (
                    <Notice
                      key={status}
                      text={status.generalError}
                      variant="error"
                    />
                  )}

                  <form>
                    <StyledTypography variant="body1">
                      We’ll use the default settings for User Account (
                      {DEFAULTS.user}) and Port ({DEFAULTS.port}) if you leave
                      those fields empty.
                    </StyledTypography>

                    <FormControlLabel
                      control={
                        <Toggle
                          checked={access}
                          name="ssh.access"
                          onChange={() => setFieldValue('ssh.access', !access)}
                        />
                      }
                      label={access ? 'Access enabled' : 'Access disabled'}
                    />

                    <TextField
                      error={!!userError}
                      errorText={userError}
                      label="User Account"
                      name="ssh.user"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder={user || DEFAULTS.user}
                      value={user}
                    />

                    <Grid container spacing={2}>
                      <StyledIPGrid md={8} xs={12}>
                        <IPSelect
                          customizeOptions={(options) => [
                            // The first option should always be "Any".
                            {
                              label: 'Any',
                              value: 'any',
                            },
                            ...options
                              // Remove Private IPs
                              .filter(
                                (option) => !privateIPRegex.test(option.value)
                              )
                              // Remove the prefix length from each option.
                              .map((option) => ({
                                label: removePrefixLength(option.value),
                                value: removePrefixLength(option.value),
                              })),
                          ]}
                          handleChange={(selectedIp: string) =>
                            setFieldValue('ssh.ip', selectedIp)
                          }
                          value={{
                            label: ip === 'any' ? 'Any' : ip,
                            value: ip,
                          }}
                          errorText={ipError}
                          linodeId={linodeSetting.id}
                        />
                      </StyledIPGrid>

                      <StyledPortGrid md={4} xs={12}>
                        <TextField
                          error={!!portError}
                          errorText={portError}
                          label="Port"
                          name="ssh.port"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder={String(port || DEFAULTS.port)}
                          type="number"
                          value={port}
                        />
                      </StyledPortGrid>
                    </Grid>
                    <ActionsPanel
                      primaryButtonProps={{
                        label: 'Save Changes',
                        loading: isSubmitting,
                        onClick: () => handleSubmit(),
                      }}
                    />
                  </form>
                </>
              );
            }}
          </Formik>
        </>
      )}
    </Drawer>
  );
};

export default EditSSHAccessDrawer;
