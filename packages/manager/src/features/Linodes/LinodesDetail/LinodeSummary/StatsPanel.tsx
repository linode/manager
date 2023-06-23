import * as React from 'react';
import { CircleProgress } from 'src/components/CircleProgress';
import { makeStyles } from '@mui/styles';
import Typography from 'src/components/core/Typography';

const useStyles = makeStyles(() => ({
  graphsUnavailable: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    padding: 16,
    paddingTop: 0,
    width: '100%',
  },
  spinner: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
}));

interface Props {
  renderBody: () => JSX.Element;
  loading: boolean;
  title: string;
  height: number;
}

export const StatsPanel: React.FC<Props> = (props) => {
  const classes = useStyles();

  const { height, loading, renderBody, title } = props;

  return (
    <>
      <Typography variant="h2" data-qa-stats-title>
        {title}
      </Typography>
      {loading ? (
        <div className={classes.spinner} style={{ minHeight: height }}>
          <CircleProgress mini />
        </div>
      ) : (
        renderBody()
      )}
    </>
  );
};
