import { makeStyles, Theme } from 'src/components/core/styles';

const useFormStyles = makeStyles((theme: Theme) => ({
  root: {},
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  checksHeaders: {
    marginBottom: theme.spacing(2)
  },
  checkGrid: {
    '& > div': {
      /** each of the text fields under the "Active Health Checks" heading */
      marginBottom: theme.spacing(4)
    }
  }
}));

export default useFormStyles;
