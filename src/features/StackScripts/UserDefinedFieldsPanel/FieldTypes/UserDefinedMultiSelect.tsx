import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import RenderGuard from 'src/components/RenderGuard';

type ClassNames = 'root' | 'toggle';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    margin: `0 0 ${theme.spacing.unit * 3}px`
  },
  toggle: {}
});

interface Props {
  updateFormState: (key: string, value: any) => void;
  udf_data: Linode.StackScript.UserDefinedField;
  field: Linode.StackScript.UserDefinedField;
  isOptional: boolean;
  error?: string;
}

interface State {
  manyof: string[];
  valueMulti: Item[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserDefinedMultiSelect extends React.Component<CombinedProps, State> {
  state: State = {
    manyof: this.props.field.manyof!.split(','),
    valueMulti: []
  };

  handleChangeMulti = (valueMulti: Item[]) => {
    this.setState({
      valueMulti
    });
  };

  render() {
    const { manyof, valueMulti } = this.state;
    const { error, field, classes, isOptional } = this.props;

    const manyOfOptions = manyof.map((choice: string) => {
      return {
        label: choice,
        value: choice
      };
    });

    return (
      <div className={classes.root}>
        {error && <Notice error text={error} spacingTop={8} />}
        <Select
          label={field.label}
          {...!isOptional && ' *'}
          isMulti={true}
          value={valueMulti}
          onChange={this.handleChangeMulti}
          options={manyOfOptions}
          small={isOptional}
        />
      </div>
    );
  }
}

const styled = withStyles(styles);

export default styled(RenderGuard<CombinedProps>(UserDefinedMultiSelect));
