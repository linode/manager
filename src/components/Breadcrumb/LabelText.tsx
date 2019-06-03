import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'root' | 'labelTitle' | 'labelSubtitle' | 'underlineOnHover';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    labelTitle: {
      padding: '0 10px',
      lineHeight: '1.5rem'
    },
    labelSubtitle: {
      margin: '8px 0 0 10px'
    },
    underlineOnHover: {
      '&:hover, &:focus': {
        textDecoration: 'underline',
        color: theme.color.black
      }
    }
  });

interface Props {
  title: string;
  subtitle?: string;
  titleLink?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const LabelText: React.StatelessComponent<CombinedProps> = props => {
  const { classes, title, subtitle, titleLink } = props;

  const labelTitle = (
    <Typography variant="h1" className={classes.labelTitle} data-qa-label-title>
      {title}
    </Typography>
  );

  return (
    <div style={{ display: 'block' }}>
      {titleLink ? (
        <Link to={titleLink!} data-qa-label-link>
          <span className={classes.underlineOnHover}>{labelTitle}</span>
        </Link>
      ) : (
        labelTitle
      )}
      {subtitle && (
        <Typography
          variant="body1"
          className={classes.labelSubtitle}
          data-qa-label-subtitle
        >
          {subtitle}
        </Typography>
      )}
    </div>
  );
};

const styled = withStyles(styles);
export default styled(LabelText);
