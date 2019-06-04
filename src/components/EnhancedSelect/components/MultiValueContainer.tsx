import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { components as reactSelectComponents } from 'react-select';
import { MultiValueGenericProps } from 'react-select/lib/components/MultiValue';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {}
  });

interface Props extends MultiValueGenericProps<any> {}

type CombinedProps = Props & WithStyles<ClassNames>;

const MultiValueContainer: React.StatelessComponent<CombinedProps> = props => {
  const { classes, ...rest } = props;

  return (
    <reactSelectComponents.MultiValueContainer
      {...rest}
      className={classes.root}
    />
  );
};

const styled = withStyles(styles);

export default styled(MultiValueContainer);
