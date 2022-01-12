import * as React from 'react';
import Grid from 'src/components/Grid';
import Typography from 'src/components/core/Typography';
import Button from 'src/components/Button';

interface Props {
  buttonText: string;
  descriptiveText: string;
  sectionTitle: string;
  onClick: () => void;
}

export const DatabaseSettingsMenuItem: React.FC<Props> = (props) => {
  const {
    buttonText,
    descriptiveText,
    sectionTitle,
    onClick,
    children,
  } = props;

  return (
    <Grid container>
      <Grid item lg={9}>
        <Typography variant="h3">{sectionTitle}</Typography>
        <Typography>{descriptiveText}</Typography>
        {children}
      </Grid>
      <Grid>
        <Button buttonType="primary" onClick={onClick}>
          {buttonText}
        </Button>
      </Grid>
    </Grid>
  );
};

export default DatabaseSettingsMenuItem;
