import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { Typography } from 'src/components/Typography';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DebouncedSearchTextField } from './DebouncedSearchTextField';