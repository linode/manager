# Component Library

## Material-UI

We use [Material-UI](https://mui.com/material-ui/getting-started/overview/) as the primary component library for Cloud Manager. The library contains many UI primitives like `<Typography />` and `<Button />`, as well as a layout system with the `<Grid />` component.

All MUI components have abstractions in the Cloud Manager codebase, meaning you will use relative imports to use them instead of importing from MUI directly:

```ts
import { Typography } from "@linode/ui"; // NOT from '@mui/material/Typography'
```

We do this because it gives us the ability to customize the component and still keep imports consistent. It also gives us flexibility if we ever wanted to change out the underlying component library.

## Reusable Components

Reusable components such as MUI abstractions and other common UI elements should be placed in the `packages/manager/src/components` directory and have an associated Storybook story.

### Storybook

We use [Storybook](https://storybook.js.org/) to document our UI component library behavior, styles, and guidelines with sample components and code. The public instance is located at [https://design.linode.com](https://design.linode.com).

#### Running Storybook Locally

`pnpm run --filter linode-manager build-storybook`: builds Storybook as a static web application, with build output located in `/packages/manager/storybook-static`; must be run from `/packages/manager` directory

`pnpm storybook`: starts the local dev server at `localhost:6006`

#### Adding Stories

To make a new story for a component, create a new file in the same directory as the `.tsx` file the component is defined in. This new file should follow the naming convention of `<Component Name>.stories.tsx`.
For example, the story for `LandingHeader.tsx` is defined in the `LandingHeader.stories.tsx` file. New entries should be categorized as one of the following:

##### Core Style

A color, font, svg icon, or other simple styling convention.

##### Element

A basic HTML element wrapped in a React component, or a small component that is not normally used on its own.

##### Component

A composition of Core Styles and Elements. Normally with some code that defines behavior. An example of a Component is a Dialog which is a composition of Typography and Buttons.

##### Feature

A Composition of Core Styles, Elements, and Components that defines a vertical slice of functionality. An example of a Feature is the Payment Method Row; it combines Components, Elements, and Core Styles like Buttons, Action Menus, Icons, Typography, etc.

#### Best Practices

Please refer to Storybook's [documentation](https://storybook.js.org/docs/react/writing-docs/introduction) for how to write stories in the CSF format.
