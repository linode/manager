import { FormikBag, FormikProps, withFormik } from 'formik';
import { compose, isEmpty } from 'ramda';
import * as React from 'react';
import { object, string } from 'yup';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import withEnhancedValidation, { EnhancedValidationProps } from 'src/components/EnhancedValidation';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Notice from 'src/components/Notice';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import TextField from 'src/components/TextField';
import { withLinode } from 'src/features/linodes/LinodesDetail/context';
import { updateLinode } from 'src/services/linodes';


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
  & FormikProps<FormValues>
  & ContextProps
  & WithStyles<ClassNames>
  & EnhancedValidationProps;

export const LinodeSettingsLabelPanel: React.StatelessComponent<CombinedProps> = (props) => {

  const {
    isSubmitting,
    handleBlur,
    handleFormSubmission,
    handleTextFieldChange,
    maybeGetErrorText,
    status,
    values
  } = props;

  return (
    <ExpansionPanel
      heading="Linode Label"
      success={status && status.success && status.message}
      actions={() =>
        <ActionsPanel>
          <Button
            onClick={handleFormSubmission}
            type="primary"
            disabled={isSubmitting}
            loading={isSubmitting}
            data-qa-label-save
          >
            Save
          </Button>
        </ActionsPanel>
      }
    >
      {status && !status.success &&
        <Notice text={status.message} error />
      }

      <TextField
        label="Label"
        name="label"
        value={values.label}
        onChange={handleTextFieldChange}
        onBlur={handleBlur}
        errorText={maybeGetErrorText('label')}
        errorGroup="linode-settings-label"
        error={!!maybeGetErrorText('label')}
        data-qa-label
      />
    </ExpansionPanel>
  );
}

const mapPropsToValues = (props: Props) => ({
  label: props.linodeLabel
});

const validationSchema = object().shape({
  label: string()
    .required('Label is required')
    .matches(/^((?!--|__).)*$/, 'Label must not include two dashes or underscores in a row')
    .matches(/^[a-zA-Z0-9].+[a-zA-Z0-9]$/, 'Label must begin and end with a letter or number')
});

const successMessage = 'Linode label changed successfully.';

const request = (ownProps: any) => updateLinode(
  ownProps.linodeId,
  ownProps.values.label)
  .then(response => response);

  const validated = withEnhancedValidation(
    mapPropsToValues,
    validationSchema,
    request,
    successMessage
  );

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
