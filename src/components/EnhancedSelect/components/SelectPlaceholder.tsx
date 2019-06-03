import * as React from 'react';
import { PlaceholderProps } from 'react-select/lib/components/Placeholder';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
  root: {
    position: 'absolute',
    left: '10px',
    wordWrap: 'normal',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    fontSize: '0.9rem'
  }
});

interface Props extends PlaceholderProps<any> {}

type CombinedProps = Props & WithStyles<ClassNames>;

const SelectPlaceholder: React.StatelessComponent<CombinedProps> = props => {
  return (
    <Typography
      className={props.classes.root}
      {...props.innerProps}
      data-qa-enhanced-select
      data-qa-multi-select={
        props.isMulti ? props.selectProps.placeholder : false
      }
    >
      {props.children}
    </Typography>
  );
};

const styled = withStyles(styles);

export default styled(SelectPlaceholder);
