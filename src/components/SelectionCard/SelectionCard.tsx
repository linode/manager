import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import CheckCircle from 'material-ui-icons/CheckCircle';

import Grid from 'material-ui/Grid';

type CSSClasses = 
'root'
| 'icon'
| 'flex'
| 'heading'
| 'innerGrid'
| 'subheading';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  root: {
    backgroundColor: '#fbfbfb',
    maxWidth: '290px',
    minHeight: '64px',
    border: '1px solid #333',
    '&:hover': {
      backgroundColor: '#f4f4f4',
    },
  },
  icon: {
    '& svg': {
      fontSize: '32px',
    },
    '& span': {
      fontSize: '32px',
    },
    '& img': {
      maxheight: '32px',
      maxWidth: '32px',
    },
  },
  heading: {
    fontWeight: 700,
    fontSize: '1em', 
  },
  subheading: {
    fontSize: '0.8em',
  },
  innerGrid: {
  },
  flex: {
    flex: 1,
  },
});

const styled = withStyles(styles, { withTheme: true });

interface Props {
  renderIcon: () => JSX.Element;
  heading: string;
  subheadings: string[];
  checked?: Boolean;
}

type CombinedProps = Props & WithStyles<CSSClasses>;

const SelectionCard: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    renderIcon,
    heading,
    subheadings,
    classes,
    checked,
  } = props;

  return (
    <div className={classes.root}>
      <Grid
        container
        alignItems="center"
        className={classes.innerGrid}
      >
        <Grid item className={classes.icon}>
          {renderIcon()}
        </Grid>

        <Grid item className={classes.flex}>
          <div className={classes.heading}>
            {heading} 
          </div>
          {subheadings.map((subheading) => {
            return (
              <div className={classes.subheading}>
                {subheading}
              </div>
            );
          })}
        </Grid>

        {checked &&
          <Grid item>
            <CheckCircle />
          </Grid>
        }
      </Grid>
    </div>
  );
};

export default styled(SelectionCard);
