import { WithStyles } from '@material-ui/core/styles';
import Close from '@material-ui/icons/Close';
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

const MultiValueRemove: React.StatelessComponent<CombinedProps> = props => {
  const { classes, ...rest } = props;

  return (
    <reactSelectComponents.MultiValueRemove {...rest}>
      <Close />
    </reactSelectComponents.MultiValueRemove>
  );
};

const styled = withStyles(styles);

export default styled(MultiValueRemove);
