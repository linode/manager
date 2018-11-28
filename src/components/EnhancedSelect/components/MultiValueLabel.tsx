import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import { path } from 'ramda';
import * as React from 'react';
import { components as reactSelectComponents } from 'react-select';
import { MultiValueGenericProps } from 'react-select/lib/components/MultiValue';

type ClassNames = 'root' | 'label';

const styles: StyleRulesCallback<ClassNames> = (theme) => {
  const rootMuiChipStyles = path(['overrides', 'MuiChip', 'root'], theme);
  const rootMuiChipStylesLabel = path(['overrides', 'MuiChip', 'label'], theme);

  return {
    root: {
      ...rootMuiChipStyles,
    },
    label: {
      ...rootMuiChipStylesLabel
    }
  }
};

interface Props extends MultiValueGenericProps<any> {
}

type CombinedProps = Props & WithStyles<ClassNames>;

const MultiValueLabel: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    ...rest
  } = props;

  return (
    <div data-qa-multi-option={props.children} className={classes.root} >
      <reactSelectComponents.MultiValueLabel {...rest} className={classes.label} />
    </div>
  );
};

const styled = withStyles(styles);

export default styled(MultiValueLabel);
