import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/styles';
import * as React from 'react';

import Typography from '@material-ui/core/Typography';

import Arrow from 'src/assets/icons/diagonalArrow.svg';

import truncateText from 'src/utilities/truncateText';

type ClassNames =
  | 'root'
  | 'label'
  | 'stackScriptUsername'
  | 'labelWrapper'
  | 'linkIcon'
  | 'title';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    display: 'block',
    '&:hover $label': {
      color: theme.palette.primary.main
    }
  },
  label: {
    cursor: 'pointer'
  },
  stackScriptUsername: {
    color: theme.color.grey1
  },
  labelWrapper: {
    display: 'flex'
  },
  linkIcon: {
    marginLeft: theme.spacing(1),
    color: theme.palette.primary.main,
    width: 14,
    height: 14
  },
  title: {
    flexGrow: 1
  }
});

interface Props {
  label: string;
  description: string;
  stackScriptUsername?: string;
  stackScriptId: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LabelCell: React.StatelessComponent<CombinedProps> = props => {
  const {
    label,
    description,
    stackScriptUsername,
    stackScriptId,
    classes
  } = props;

  return (
    <React.Fragment>
      <a
        target="_blank"
        href={`https://www.linode.com/stackscripts/view/${stackScriptId}`}
        className={classes.root}
      >
        <div className={classes.labelWrapper}>
          <Typography className={classes.title} variant="h3">
            {stackScriptUsername && (
              <label
                htmlFor={`${stackScriptId}`}
                className={`${classes.label} ${classes.stackScriptUsername}`}
              >
                {stackScriptUsername} /&nbsp;
              </label>
            )}
            <label htmlFor={`${stackScriptId}`} className={classes.label}>
              {label}
            </label>
            <Arrow className={classes.linkIcon} />
          </Typography>
        </div>
        <Typography variant="body1">
          {truncateText(description, 100)}
        </Typography>
      </a>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default styled(LabelCell);
