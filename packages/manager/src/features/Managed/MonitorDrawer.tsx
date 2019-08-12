import { Formik } from 'formik';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import {
  makeStyles,
  Theme,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';

const useStyles = makeStyles((theme: Theme) =>
  ({
    root: {},
    suffix: {
      fontSize: '.9rem',
      marginRight: theme.spacing(1)
    },
    actionPanel: {
      marginTop: theme.spacing(2)
    },
    helperText: {
      paddingTop: theme.spacing(1) / 2
    }
  }));

export interface Props {
  mode: 'create' | 'edit';
  open: boolean;
  label?: string;
  successMsg?: string;
  onClose: () => void;
  onSubmit: (values: any) => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

export const modes = {
  CREATING: 'create',
  EDITING: 'edit'
};

const titleMap = {
  [modes.CREATING]: 'Add a Monitor',
  [modes.EDITING]: 'Edit a Monitor',
};

const MonitorDrawer: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    mode,
    open,
    onClose,
    onSubmit,
    successMsg,
  } = props;

  

  return (
    <Drawer title={titleMap[mode]} open={open} onClose={onClose}>
      <Formik
        initialValues={{ label: '' }}
        // validationSchema={createObjectStorageKeysSchema}
        validateOnChange={false}
        validateOnBlur={true}
        onSubmit={onSubmit}
      >
        {({
          values,
          errors,
          status,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting
        }) => (
          <>
            {status && (
              <Notice key={status} text={status} error data-qa-error />
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                name="label"
                label="Label"
                data-qa-add-label
                value={values.label}
                error={!!errors.label}
                errorText={errors.label}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ActionsPanel>
                <Button
                  buttonType="primary"
                  onClick={() => handleSubmit()}
                  loading={isSubmitting}
                  data-qa-submit
                >
                  Submit
                </Button>
                <Button
                  onClick={onClose}
                  data-qa-cancel
                  buttonType="secondary"
                  className="cancel"
                >
                  Cancel
                </Button>
              </ActionsPanel>
            </form>
          </>
        )}
      </Formik>
    </Drawer>
  );
}

export default compose<CombinedProps, Props>(
  withRouter,
)(MonitorDrawer);
