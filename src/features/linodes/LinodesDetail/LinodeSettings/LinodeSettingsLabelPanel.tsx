import { FormikBag, FormikProps, withFormik } from 'formik';
import { compose, isEmpty } from 'ramda';
import * as React from 'react';
import { object, string } from 'yup';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Notice from 'src/components/Notice';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import TextField from 'src/components/TextField';
import { withLinode } from 'src/features/linodes/LinodesDetail/context';
import { updateLinode } from 'src/services/linodes';
import { defaultOptions, GeneralAPIError, handleFormChange, handleFormSubmission } from 'src/utilities/formikUtil';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = () => ({
  root: {},
});

interface Props {
  linodeLabel: string;
}

interface FormValues {
  label: string;
}

interface ContextProps {
  linodeLabel: string;
  linodeId: number;
  updateLinode: (f: (t: Linode.Linode) => Linode.Linode) => void;
}

type CombinedProps = Props
  & FormikProps<FormValues & GeneralAPIError>
  & ContextProps
  & WithStyles<ClassNames>;

export const LinodeSettingsLabelPanel: React.StatelessComponent<CombinedProps> = (props) => {
  return (
    <ExpansionPanel
      heading="Linode Label"
      success={props.status && props.status.success && props.status.message}
      actions={() =>
        <ActionsPanel>
          <Button
            onClick={props.submitForm}
            type="primary"
            disabled={props.isSubmitting || !isEmpty(props.errors)}
            loading={props.isSubmitting}
            data-qa-label-save
          >
            Save
          </Button>
        </ActionsPanel>
      }
    >
      {props.status && !props.status.success &&
        <Notice text={props.status.message} error />
      }

      <TextField
        label="Label"
        name="label"
        value={props.values.label}
        onChange={(e: any) => handleFormChange(e, props)}
        onBlur={props.handleBlur}
        errorText={props.errors.label}
        errorGroup="linode-settings-label"
        error={Boolean(props.errors.label)}
        data-qa-label
      />
    </ExpansionPanel>
  );
}

const validated = withFormik<Props, FormValues>({

  ...defaultOptions,

  isInitialValid: true,

  mapPropsToValues: (props: Props) => ({
    label: props.linodeLabel
  }),

  validationSchema: () => {
    return object().shape({
      label: string()
        .required('Label is required')
        .matches(/^((?!--|__).)*$/, 'Label must not include two dashes or underscores in a row')
        .matches(/^[a-zA-Z0-9].+[a-zA-Z0-9]$/, 'Label must begin and end with a letter or number')
    });
  },

  handleSubmit: (values: FormValues, formikBag: FormikBag<CombinedProps, FormValues>) => {
    const { linodeId } = formikBag.props;
    const { label } = values;

    const successMessage: string = 'Linode label changed successfully.';
    const request = () => updateLinode(linodeId, { label });

    handleFormSubmission<CombinedProps, FormValues>(request, successMessage, formikBag)
      .then((linode: Linode.Linode) => {
        formikBag.props.updateLinode((existingLinode) => ({
          ...existingLinode,
          ...linode,
        }));
      });
  }
});

const styled = withStyles(styles, { withTheme: true });

const errorBoundary = PanelErrorBoundary({ heading: 'Linode Label' });

const linodeContext = withLinode((context) => ({
  linodeId: context.data!.id,
  linodeLabel: context.data!.label,
  updateLinode: context.update,
}));

export default compose(
  errorBoundary,
  styled,
  linodeContext,
  validated
)(LinodeSettingsLabelPanel) as React.ComponentType<{}>;
