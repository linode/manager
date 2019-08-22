import { Formik, FormikActions } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import IPSelect from 'src/components/IPSelect';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import Toggle from 'src/components/Toggle';
import { updateLinodeSettings } from 'src/services/managed';
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/utilities/formikErrorUtils';
import { privateIPRegex, removePrefixLength } from 'src/utilities/ipUtils';
import { DEFAULTS } from './common';

const useStyles = makeStyles((theme: Theme) => ({
  ip: {
    [theme.breakpoints.down('sm')]: {
      paddingBottom: '0px !important'
    }
  },
  port: {
    [theme.breakpoints.down('sm')]: {
      paddingTop: '0px !important'
    }
  },
  helperText: {
    marginBottom: theme.spacing(1) + 2
  }
}));

interface Props {
  isOpen: boolean;
  closeDrawer: () => void;
  updateOne: (linodeSetting: Linode.ManagedLinodeSetting) => void;
  linodeSetting?: Linode.ManagedLinodeSetting;
}

type CombinedProps = Props;

const EditSSHAccessDrawer: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { isOpen, closeDrawer, linodeSetting, updateOne } = props;

  const title = linodeSetting
    ? `Edit SSH Access for ${linodeSetting.label}`
    : 'Edit SSH Access';

  const onSubmit = (
    values: Linode.ManagedLinodeSetting,
    {
      setErrors,
      setSubmitting,
      setStatus
    }: FormikActions<Linode.ManagedLinodeSetting>
  ) => {
    // It probably isn't possible to end up here without linodeSetting,
    // but we'll include an early return to make TypeScript happy.
    if (!linodeSetting) {
      return;
    }

    // If the user has blanked out these fields, exchange in the defaults
    // for `user` and `port`. We could also choose to NOT send these to
    // the API to update, but this effectively achieves the same thing.
    const user = values.ssh.user !== '' ? values.ssh.user : DEFAULTS.user;
    const port =
      String(values.ssh.port) !== '' ? values.ssh.port : DEFAULTS.port;

    updateLinodeSettings(linodeSetting.id, {
      ssh: { ...values.ssh, user, port }
    })
      .then(updatedLinodeSetting => {
        setSubmitting(false);
        updateOne(updatedLinodeSetting);
        closeDrawer();
      })
      .catch(err => {
        setSubmitting(false);
        const defaultMessage = `Unable to update SSH Access for this Linode. Please try again later.`;
        const mapErrorToStatus = (generalError: string) =>
          setStatus({ generalError });

        setSubmitting(false);
        handleFieldErrors(setErrors, err);
        handleGeneralErrors(mapErrorToStatus, err, defaultMessage);
      });
  };

  return (
    <Drawer title={title} open={isOpen} onClose={closeDrawer}>
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
                user: linodeSetting.ssh.user,
                ip: linodeSetting.ssh.ip,
                port: linodeSetting.ssh.port
              }
            }}
            onSubmit={onSubmit}
          >
            {({
              values,
              errors,
              status,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
              setFieldValue
            }) => {
              const { access, user, ip, port } = values.ssh;

              const userError = errors['ssh.user'];

              // API oddity: IP errors come back as {field: 'ip'} instead of {field: 'ssh.ip'} liked we'd expect.
              // tslint:disable-next-line
              const ipError = errors['ssh.ip'] || errors['ip'];

              const portError = errors['ssh.port'];

              return (
                <>
                  {status && (
                    <Notice key={status} text={status.generalError} error />
                  )}

                  <form>
                    <Typography
                      variant="body1"
                      className={classes.helperText}
                      data-qa-volume-size-help
                    >
                      We’ll use the default settings for User Account (
                      {DEFAULTS.user}) and Port ({DEFAULTS.port}) if you leave
                      those fields empty.
                    </Typography>

                    <FormControlLabel
                      control={
                        <Toggle
                          name="ssh.access"
                          checked={!access}
                          onChange={() => setFieldValue('ssh.access', !access)}
                        />
                      }
                      label={access ? 'Access disabled' : 'Access enabled'}
                    />

                    <TextField
                      name="ssh.user"
                      label="User Account"
                      value={user}
                      error={!!userError}
                      errorText={userError}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={user || DEFAULTS.user}
                    />

                    <Grid container>
                      <Grid item xs={12} md={8} className={classes.ip}>
                        <IPSelect
                          linodeId={linodeSetting.id}
                          value={{
                            label: ip === 'any' ? 'Any' : ip,
                            value: ip
                          }}
                          customizeOptions={options => [
                            // The first option should always be "Any".
                            {
                              label: 'Any',
                              value: 'any'
                            },
                            ...options
                              // Remove Private IPs
                              .filter(
                                option => !privateIPRegex.test(option.value)
                              )
                              // Remove the prefix length from each option.
                              .map(option => ({
                                label: removePrefixLength(option.value),
                                value: removePrefixLength(option.value)
                              }))
                          ]}
                          handleChange={(selectedIp: string) =>
                            setFieldValue('ssh.ip', selectedIp)
                          }
                          errorText={ipError}
                        />
                      </Grid>

                      <Grid item xs={12} md={4} className={classes.port}>
                        <TextField
                          name="ssh.port"
                          label="Port"
                          type="number"
                          value={port}
                          error={!!portError}
                          errorText={portError}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder={String(port || DEFAULTS.port)}
                        />
                      </Grid>
                    </Grid>
                    <ActionsPanel>
                      <Button
                        buttonType="primary"
                        onClick={() => handleSubmit()}
                        loading={isSubmitting}
                      >
                        Save
                      </Button>
                    </ActionsPanel>
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
