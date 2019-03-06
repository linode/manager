import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import HelpOutline from '@material-ui/icons/HelpOutline';
import * as React from 'react';
import { components as reactSelectComponents } from 'react-select';
import _MenuList, {
  MenuListComponentProps
} from 'react-select/lib/components/Menu';
import Typography from 'src/components/core/Typography';

type ClassNames = 'guidance' | 'text' | 'helpIcon';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  guidance: {
    backgroundColor: theme.bg.offWhiteDT,
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing.unit * 2
  },
  text: {
    fontSize: '.8rem'
  },
  helpIcon: {
    width: 16,
    height: 16,
    position: 'relative',
    top: 3,
    marginRight: theme.spacing.unit
  }
});

type CombinedProps = MenuListComponentProps<any> & WithStyles<ClassNames>;

const Menu: React.StatelessComponent<CombinedProps> = props => {
  const { classes } = props;
  const { guidance } = props.selectProps;

  return (
    <React.Fragment>
      <reactSelectComponents.MenuList {...props}>
        {props.children}
      </reactSelectComponents.MenuList>
      {guidance !== undefined && (
        <div className={classes.guidance}>
          <Typography className={classes.text}>
            <HelpOutline className={classes.helpIcon} />
            {guidance}
          </Typography>
        </div>
      )}
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default styled(Menu);
