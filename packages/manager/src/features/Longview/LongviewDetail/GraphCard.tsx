import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  graphContainer: {
    marginTop: theme.spacing(),
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'space-around',
    '& > div': {
      flexGrow: 1,
      width: '33%',
      [theme.breakpoints.down('md')]: {
        marginTop: theme.spacing(),
        width: '60%'
      }
    }
  }
}));

interface Props {
  title: string;
  helperText?: string;
}

export const GraphCard: React.FC<Props> = props => {
  const { helperText, title } = props;
  const classes = useStyles();

  return (
    <React.Fragment>
      <Typography variant="subtitle1">
        <React.Fragment>
          <strong>{title}</strong>
          {!!helperText && <React.Fragment> &ndash; </React.Fragment>}
          {helperText}
        </React.Fragment>
      </Typography>
      <div className={classes.graphContainer}>{props.children}</div>
    </React.Fragment>
  );
};

export default GraphCard;
