import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import RenderGuard from 'src/components/RenderGuard';

import RegionSelect, {
  ExtendedRegion
} from 'src/components/EnhancedSelect/variants/RegionSelect';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    '& svg': {
      '& g': {
        // Super hacky fix for Firefox rendering of some flag icons that had a clip-path property.
        clipPath: 'none !important' as 'none'
      }
    }
  },
  label: {
    color: theme.color.headline,
    fontFamily: theme.font.bold,
    fontSize: '12px',
    fontWeight: 600,
    lineHeight: '1.33rem',
    letterSpacing: '0.25px'
  },
  subtitle: {
    fontWeight: 500,
    lineHeight: '1.43rem',
    marginBottom: '4px'
  },
  inputWidth: {
    maxWidth: 440
  }
}));

interface Props {
  regions: ExtendedRegion[];
  copy?: string;
  error?: string;
  handleSelection: (id: string) => void;
  selectedID?: string;
  disabled?: boolean;
}

type CombinedProps = Props;

const MinimalRegionPanel: React.FC<CombinedProps> = props => {
  const { disabled, error, handleSelection, regions, selectedID } = props;

  const classes = useStyles();

  if (props.regions.length === 0) {
    return null;
  }

  return (
    <>
      <Typography className={classes.label} data-qa-tp="Region">
        Region
      </Typography>
      <Typography className={classes.subtitle} variant="body1">
        You can use
        {` `}
        <a
          target="_blank"
          aria-describedby="external-site"
          rel="noopener noreferrer"
          href="https://www.linode.com/speedtest"
        >
          our speedtest page
        </a>
        {` `}
        to find the best region for your current location.
      </Typography>

      <RegionSelect
        className={classes.inputWidth}
        errorText={error}
        disabled={disabled}
        handleSelection={handleSelection}
        regions={regions}
        selectedID={selectedID || null}
        label={''}
        placeholder={' '}
      />
    </>
  );
};

export default compose<CombinedProps, Props>(RenderGuard)(MinimalRegionPanel);
