import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import { path } from 'ramda';
import * as React from 'react';
import { MultiValueGenericProps } from 'react-select/lib/components/MultiValue';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => {
  const rootMuiChipStyles = path(['overrides', 'MuiChip', 'root'], theme);

  return {
    root: {
      ...rootMuiChipStyles,
    },
  }
};

interface Props extends MultiValueGenericProps<any>{
}

type CombinedProps = Props & WithStyles<ClassNames>;

const MultiValueLabel: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    innerProps: { className, ...restInnerProps },
    ...rest
  } = props;

  const updatedProps = {
    ...rest,
    innerProps: restInnerProps,
  };

  return (
    <div {...updatedProps} className={classes.root} data-qa-multi-option={props.children} />
  );
};

const styled = withStyles(styles);

export default styled(MultiValueLabel);
