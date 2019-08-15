import { Formik } from 'formik';
import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { makeStyles, Theme } from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import IPSelect from 'src/components/IPSelect';
import TextField from 'src/components/TextField';
import Toggle from 'src/components/Toggle';
import { updateManagedLinodeSchema } from 'src/services/managed/managed.schema';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    // width: '100%'
  },
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
  linodeSetting?: Linode.ManagedLinodeSetting;
}

type CombinedProps = Props;

const EditSSHAccessDrawer: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { isOpen, closeDrawer, linodeSetting } = props;

  const title = linodeSetting
    ? `Edit SSH Access for ${linodeSetting.label}`
    : 'Edit SSH Access';

  const onSubmit = () => alert('submit');

  return (
    <Drawer title={title} open={isOpen} onClose={closeDrawer}>
      {!linodeSetting ? null : (
        <>
          <Formik
            initialValues={{
              access: linodeSetting.ssh.access,
              user: linodeSetting.ssh.user || 'root',
              port: linodeSetting.ssh.port || 22,
              ip: linodeSetting.ssh.ip === 'any' ? 'Any' : linodeSetting.ssh.ip
            }}
            validationSchema={updateManagedLinodeSchema}
            validateOnChange={false}
            validateOnBlur={false}
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
              return (
                <form className={classes.root}>
                  <FormControlLabel
                    control={
                      <Toggle
                        name="access"
                        checked={!values.access}
                        onChange={() => setFieldValue('access', !values.access)}
                      />
                    }
                    label={values.access ? 'Access disabled' : 'Access enabled'}
                  />

                  <TextField
                    name="user"
                    label="User Account"
                    value={values.user}
                    error={!!errors.user}
                    errorText={errors.user}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />

                  <Grid container>
                    <Grid item xs={12} md={8} className={classes.ip}>
                      <IPSelect
                        linodeId={linodeSetting.id}
                        value={{
                          label: values.ip === 'any' ? 'Any' : values.ip,
                          value: values.ip
                        }}
                        handleChange={(ip: string) => setFieldValue('ip', ip)}
                      />
                    </Grid>

                    <Grid item xs={12} md={4} className={classes.port}>
                      <TextField
                        name="port"
                        label="Port"
                        type="number"
                        value={values.port}
                        error={!!errors.port}
                        errorText={errors.port}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Grid>
                  </Grid>
                </form>
              );
            }}
          </Formik>
        </>
      )}
    </Drawer>
  );
};

export default EditSSHAccessDrawer;
