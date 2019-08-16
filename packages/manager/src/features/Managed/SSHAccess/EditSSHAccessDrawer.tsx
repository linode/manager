import { Formik, FormikActions } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { makeStyles, Theme } from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import IPSelect from 'src/components/IPSelect';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import Toggle from 'src/components/Toggle';
// @todo: Extract these utils out of Volumes
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/features/Volumes/VolumeDrawer/utils';
import { updateLinodeSettings } from 'src/services/managed';
import { removePrefixLength } from 'src/utilities/ipUtils';

const DEFAULTS = {
  user: 'root',
  port: 22
};

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

    // If the user has cleared this field, replace it with the default.
    const port =
      !values.ssh.port && values.ssh.port !== 0
        ? DEFAULTS.port
        : values.ssh.port;

    updateLinodeSettings(linodeSetting.id, {
      ssh: { ...values.ssh, port }
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
          <Formik
            initialValues={{
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
              const ipError = errors['ssh.user'] || errors['ip'];

              const portError = errors['ssh.port'];

              return (
                <>
                  {status && (
                    <Notice key={status} text={status.generalError} error />
                  )}

                  <form>
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
                            // Remove the prefix length from each option.
                            ...options.map(option => ({
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
