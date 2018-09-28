import * as React from 'react';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

import Notice from 'src/components/Notice';

type ClassNames = 'root' | 'link';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  link: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    }
  }
});

interface Props {
  text: string;
  type: string;
  onClick: (type: string) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const MigrationNotification : React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, onClick, text, type } = props;

  const handleClick = () => {
    onClick(type);
  }
  
  return (
    <Notice flag warning>
      {text}
      {' To enter the migration queue right now, please '}
      <span className={classes.link} onClick={handleClick}>click here</span>.
    </Notice>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(MigrationNotification);
