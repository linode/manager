import * as React from 'react';
import * as classNames from 'classnames';
import { PlaceholderProps } from 'react-select';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'root' | 'smallerFontSize';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      position: 'absolute',
      left: '10px',
      wordWrap: 'normal',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      fontSize: '0.9rem'
    },
    smallerFontSize: {
      fontSize: '0.875rem !important'
    }
  });

interface Props extends PlaceholderProps<any> {
  smallerPlaceholder?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const SelectPlaceholder: React.FC<CombinedProps> = props => {
  return (
    <Typography
      className={classNames({
        [props.classes.root]: true,
        [props.classes.smallerFontSize]: props.smallerPlaceholder
      })}
      {...props.innerProps}
      data-qa-select-placeholder
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
