import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/styles';
import * as React from 'react';
import { components as reactSelectComponents } from 'react-select';
import { MultiValueGenericProps } from 'react-select/lib/components/MultiValue';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => {
  return {
    root: {}
  };
};

interface Props extends MultiValueGenericProps<any> {}

type CombinedProps = Props & WithStyles<ClassNames>;

const MultiValueLabel: React.StatelessComponent<CombinedProps> = props => {
  const { classes, ...rest } = props;

  return (
    <div data-qa-multi-option={props.children} className={classes.root}>
      <reactSelectComponents.MultiValueLabel {...rest} />
    </div>
  );
};

const styled = withStyles(styles);

export default styled(MultiValueLabel);
