import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import * as React from 'react';

import Typography from '@material-ui/core/Typography';
import OpenInNew from '@material-ui/icons/OpenInNew';

import truncateText from 'src/utilities/truncateText';

type ClassNames = 'root'
  | 'label'
  | 'stackScriptUsername'
  | 'labelWrapper'
  | 'linkIcon'
  | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  label: {
    cursor: 'pointer',
  },
  stackScriptUsername: {
    color: theme.color.grey1,
  },
  labelWrapper: {
    display: 'flex',
  },
  linkIcon: {
    marginLeft: '.5em',
    width: '10%'
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

const LabelCell: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    label,
    description,
    stackScriptUsername,
    stackScriptId,
    classes
  } = props;

  return (
    <React.Fragment>
      <a target="_blank" href={`https://www.linode.com/stackscripts/view/${stackScriptId}`}>
        <div className={classes.labelWrapper}>
          <Typography className={classes.title} role="header" variant="subheading">
            {stackScriptUsername &&
              <label
                htmlFor={`${stackScriptId}`}
                className={`${classes.label} ${classes.stackScriptUsername}`}>
                {stackScriptUsername} /&nbsp;
            </label>
            }
            <label
              htmlFor={`${stackScriptId}`}
              className={classes.label}>
              {label}
            </label>
          </Typography>
          <OpenInNew className={classes.linkIcon} />
        </div>
        <Typography variant="caption">{truncateText(description, 100)}</Typography>
      </a>
    </React.Fragment>
  )
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(LabelCell);

