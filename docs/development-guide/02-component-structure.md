# Component Structure

Components are the basic building blocks of the Cloud Manager UI. Many components are atomic and reusable, appearing in many places across the app (e.g. `<Button />`), while others act as layouts or containers, managing state and routes for entire sections of the app (e.g. `<LinodesLanding />`).

The basic structure of a component file should follow:

```
[ imports ]
[ styles ]
[ types and interfaces ]
[ function component definition ]
[ utility functions ]
[ default export ]
```

Here is a minimal code example demonstrating the basic structure of a component file:

```tsx
import * as React from "react";
import { makeStyles, Theme } from "src/components/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  name: {
    color: theme.color.black,
  },
}));

interface Props {
  name: string;
}

const SayHello: React.FC<Props> = (props) => {
  const classes = useStyles();
  return <h1 className={classes.name}>Hello, {capitalize(props.name)}</h1>;
};

export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export default SayHello;
```

#### Imports

- Import React with `import * as React from 'react'`.
- Use absolute imports, e.g. `import { queryClient } from 'src/queries/base'`.
- Methods from the api-v4 package should be imported from `@linode/api-v4/lib/..`.

#### Styles

- Most components should use `makeStyles` for styling.
  - The `theme` argument should be used for global definitions (like theme colors).
  - The class names `makeStyles` generates are dynamic and may change between renders.
- It's OK to write the styles directly in an HTML component instead of importing `makeStyles` if only a few styles are needed.
  - e.g. `<h1 style={{ marginTop: 8 }}>Hello</h1>`.

#### Types and Interfaces

- To specify component props, define an interface called `Props` and pass it to the component as a type argument
  - e.g. `const SayHello: React.FC<Props> // ...`

#### Function Component Definition

- Prefer function components over class components.
  - Almost all new components in the repository are function components, though legacy class components are still present.

#### Utility Functions

- Utility functions in use by _this component only_ should go here
- Before composing a utility function, check to see if it already exists in `src/utilities`.

#### Default Export

- Usually you'll export the component by default,
  - e.g. `export default = MyComponent`
