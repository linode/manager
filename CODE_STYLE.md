# Code Style

This document aims to give general guidelines of how code is written and structured in the Cloud Manager project.

### Importing and Structuring Dependencies

This project relies on a number of third-party dependencies. It us important that when importing those
dependencies you import only the necessary files. For example, if I needed to create an Observable
using RxJS I would import only Observable and the type of Observable I want to create. This keeps bundle
size down substantially.

```
/** Good */
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';

/** Bad */
import { Observable } from 'rxjs/Rx';
```
Additionally we order imports alphabetically within certain blocks. The blocks are;
```
/** Third Party Libs /**
import * as React from 'react';

/** Material UI Imports /**
import { WithStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

/** Source Components /**
import { getLinodes } from 'src/services/linodes';

/** Relative Imports /**
import something from '../some/where/nearby';
```