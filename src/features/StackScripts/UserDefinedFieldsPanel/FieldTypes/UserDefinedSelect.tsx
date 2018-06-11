import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import { assocPath } from 'ramda';

import Radio from 'src/components/Radio';

import { StateToUpdate as FormState } from '../../../linodes/LinodesCreate';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  updateFormState: (stateToUpdate: FormState[]) => void;
  oneof: string;
  udf_data: any;
  fieldName: string;
}

interface State {
  oneof: string[];
  selectedOption: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserDefinedSelect extends React.Component<CombinedProps, State> {
  state: State = {
    oneof: this.props.oneof.split(','),
    selectedOption: '',
  };

  checkThing = (e: any) => {
    const { updateFormState, udf_data, fieldName } = this.props;

    const newUDFData = assocPath([fieldName], e.target.value, udf_data);

    updateFormState([{
      stateKey: 'udf_data',
      newValue: { ...udf_data, ...newUDFData },
    }]);

  }

  render() {
    const { oneof } = this.state;
    const { udf_data, fieldName } = this.props;

    return (
      <React.Fragment>
        {fieldName}
        {oneof.map((choice: string, index) => {
          return (
            <React.Fragment key={index}>
              <Radio
                name="Test"
                checked={!!udf_data[fieldName] && udf_data[fieldName] === choice}
                value={choice}
                onChange={this.checkThing}
                data-qa-perm-none-radio
              />
              {choice}
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(UserDefinedSelect);
