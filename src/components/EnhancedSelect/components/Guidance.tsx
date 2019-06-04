import { WithStyles } from '@material-ui/core/styles';
import HelpOutline from '@material-ui/icons/HelpOutline';
import * as React from 'react';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'guidance' | 'text' | 'helpIcon';

const styles = (theme: Theme) =>
  createStyles({
    guidance: {
      backgroundColor: theme.bg.offWhiteDT,
      borderTop: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing(2)
    },
    text: {
      fontSize: '.8rem'
    },
    helpIcon: {
      width: 16,
      height: 16,
      position: 'relative',
      top: 3,
      marginRight: theme.spacing(1)
    }
  });

/** arbitrary comment lolololol */

interface GuidanceProps {
  text: string;
}
type CombinedProps = GuidanceProps & WithStyles<ClassNames>;

const Guidance: React.StatelessComponent<CombinedProps> = props => {
  const { classes, text } = props;
  return (
    <div className={classes.guidance}>
      <Typography className={classes.text}>
        <HelpOutline className={classes.helpIcon} />
        {text}
      </Typography>
    </div>
  );
};

const styled = withStyles(styles);

export default styled(Guidance);
