import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Close from '@material-ui/icons/Close';
import * as React from 'react';
import { components as reactSelectComponents } from 'react-select';
import { MultiValueGenericProps } from 'react-select/lib/components/MultiValue';

type ClassNames = 'root' | 'icon';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    borderRadius: '4px',
  },
  icon: {
    backgroundColor: 'blue',
    color: 'white',
  },
});

interface Props extends MultiValueGenericProps<any> {}

type CombinedProps = Props & WithStyles<ClassNames>;

const MultiValueRemove: React.StatelessComponent<CombinedProps> = (props) => {
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
    <reactSelectComponents.MultiValueRemove {...updatedProps} className={classes.root}>
      <Close className={classes.icon} />
    </reactSelectComponents.MultiValueRemove>
  );
};

const styled = withStyles(styles);

export default styled(MultiValueRemove);
