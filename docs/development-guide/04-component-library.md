# Component Library

## Material-UI

We use [Material-UI](https://material-ui.com/) as the primary component library for Cloud Manager. The library contains many UI primitives like `<Typography />` and `<Button />` as well as a layout system with the `<Grid />` component.

All MUI components have abstractions in the Cloud Manager codebase, meaning you will use relative imports to use them instead of importing from MUI directly:

```ts
import Typography from "src/components/core/Typography"; // NOT from '@material-ui/core/Typography'
```

We do this because it gives us the ability to customize the component and still keep imports consistent. It also gives us flexibility if we ever wanted to change out the underlying component library.

## Reusable Components

Reusable components such as MUI abstractions and other common UI elements should be placed in the `packages/manager/src/components` directory and have an associated Storybook story.
