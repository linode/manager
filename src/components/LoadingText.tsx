import * as React from 'react';
import { WithStyles } from '@material-ui/core/styles';
import {
  createStyles,
  Theme,
  withStyles
} from 'src/components/core/styles';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
  root: {
    display: 'inline-block',
    backgroundImage: 'linear-gradient( #efefef 20px, transparent 0 )',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '0 0'
  }
});

interface Props {
  width?: number;
  height?: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LoadingText: React.StatelessComponent<CombinedProps> = props => {
  const { height, width } = props;
  const style = {
    width: `${width || 100}px`,
    height: `${height || 16}px`,
    backgroundSize: `${width || 100}px ${height || 16}px`
  };

  return <span className={props.classes.root} style={style} />;
};

const styled = withStyles(styles);

export default styled(LoadingText);
