import * as React from 'react';
import { PlaceholderProps } from 'react-select/lib/components/Placeholder';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    position: 'absolute',
    left: '10px'
  },
});

interface Props extends PlaceholderProps<any> { }

type CombinedProps = Props & WithStyles<ClassNames>;

const SelectPlaceholder: React.StatelessComponent<CombinedProps> = (props) => {
  return (
    <Typography
      className={props.classes.root}
      {...props.innerProps}
      data-qa-enhanced-select
      data-qa-multi-select={props.isMulti ? props.selectProps.placeholder : false}
    >
      {props.children}
    </Typography>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(SelectPlaceholder);
