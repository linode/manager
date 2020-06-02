import * as React from 'react';

import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import Typography from 'src/components/core/Typography';
import Button from 'src/components/Button';
import DocumentationButton from 'src/components/CMR_DocumentationButton';

const useStyles = makeStyles((theme: Theme) => ({ root: {} }));

export interface HeaderProps {
  title: string;
  iconType: string;
  onAddNew?: () => void;
  docsLink?: string;
}

export type CombinedProps = HeaderProps;

export const LandingHeader: React.FC<CombinedProps> = props => {
  const { docsLink, onAddNew, title } = props;
  const classes = useStyles();

  return (
    <Grid
      container
      alignItems="center"
      justify="space-between"
      className={classes.root}
    >
      <Grid item>
        <Grid container direction="row" alignItems="center">
          <Grid item>
            <i />
          </Grid>
          <Grid item>
            <Typography variant="h2">{title}s</Typography>
          </Grid>
        </Grid>
      </Grid>
      {props.children && <Grid item>{props.children}</Grid>}
      <Grid item>
        <Grid container direction="row" alignItems="center" justify="center">
          {onAddNew && (
            <Grid item>
              <Button buttonType="primary" onClick={onAddNew}>
                Create a {title}
              </Button>
            </Grid>
          )}
          {docsLink && <DocumentationButton href={docsLink} />}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default React.memo(LandingHeader);
