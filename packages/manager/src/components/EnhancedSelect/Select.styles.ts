import { makeStyles } from 'tss-react/mui';

import type { Theme } from '@mui/material/styles';

// TODO jss-to-tss-react codemod: usages of this hook outside of this file will not be converted.
export const useStyles = makeStyles()((theme: Theme) => ({}));

// @todo @tdt: Replace the class name based styles above with these. They're (mostly) copied over,
// as they're needed for one specific case: where a Select component appears on a Dialog. To reduce
// duplication, we can use these styles only by providing the result of this function as the styles
// prop on the Select component in ./Select.tsx.
//
// We'll need extensive regression testing on existing Selects before removing the classes.
export const reactSelectStyles = (theme: Theme) => ({});
