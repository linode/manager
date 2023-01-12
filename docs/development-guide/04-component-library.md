# Component Library

## Material-UI

We use [Material-UI](https://material-ui.com/) as the primary component library for Cloud Manager. The library contains many UI primitives like `<Typography />` and `<Button />` as well as a layout system with the `<Grid />` component.

All MUI components have abstractions in the Cloud Manager codebase, meaning you will use relative imports to use them instead of importing from MUI directly:

```ts
import Typography from "src/components/core/Typography"; // NOT from '@mui/material/Typography'
```

We do this because it gives us the ability to customize the component and still keep imports consistent. It also gives us flexibility if we ever wanted to change out the underlying component library.

## Reusable Components

Reusable components such as MUI abstractions and other common UI elements should be placed in the `packages/manager/src/components` directory and have an associated Storybook story.

### Storybook

We use [Storybook](https://storybook.js.org/) to document our UI component library behavior, styles, and guidelines with sample components and code. The public instance is located at [https://design.linode.com](https://design.linode.com).

#### Running Storybook Locally

`yarn build-storybook`: builds Storybook as a static web application, with build output located in `/packages/manager/storybook-static`; must be run from `/packages/manager` directory

`yarn storybook`: starts the local dev server at `localhost:6006`

#### Adding Stories

To make a new story for a component, create a new file in the same directory as the `.tsx` file the component is defined in. This new file should follow the naming convention of `<Component Name>.stories.mdx`.
For example, the story for `EnhancedNumberInput.tsx` is defined in the `EnhancedNumberInput.stories.mdx` file. New entries should be categorized as one of the following:

##### Core Style
A color, font, svg icon, or other simple styling convention.
##### Element
A basic HTML element wrapped in a React component or a small component that is not normally used on its own.
##### Component
A composition of Core Styles and Elements. Normally with some code that defines behavior. An example of a Component is a Dialog which is a composition of Typography and Buttons.
##### Feature
A Composition of Core Styles, Elements, and Components that defines a vertical slice of functionality. An example of a Feature is the Payment Method Row: it combines Components, Elements, and Core Styles like Buttons, Action Menus, Icons, Typography, etc.

The `Meta` tag's `title` prop is used to define how a story is categorized within these categories. For example, the `Meta` tag for the Payment Method Row is defined like this:
```ts
<Meta title="Features/Payment Method Row" component={PaymentMethodRow} />
```

A story might also be grouped within a single entry in one of these categories. In this case, define a single story that combines examples of each. For example, `Dialogs.stories.mdx` imports all the types of Dialogs from their `.tsx` files. 

```ts
import Dialog from './Dialog';
import DeletionDialog from 'src/components/DeletionDialog';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
```

Use the `name` field on the `Story` tags to display the different types of Dialogs. For example, within the `Dialog.stories.mdx` file there are multiple `Story` tags:

```ts
<Story
    name="Dialog"
    args={{
      open: true,
      fullHeight: false,
      fullWidth: false,...>
```
```ts
<Story
    name="Confirmation Dialog"
    args={{
      open: true,
      title: 'Enable this feature?',
      children: 'This confirmation modal is making sure you really want to do this.',...>
```
```ts
<Story
    name="Deletion Dialog"
    args={{
      open: true,
      typeToConfirm: true,
      entity: 'Linode',
      label: 'my-linode-0',...>
```
#### Best Practices

- Write new stories in [MDX](https://storybook.js.org/docs/react/api/mdx) format with a `.mdx` file extension. Older stories might follow the [Component Story Format (CSF)](https://storybook.js.org/docs/react/api/csf), an ES6 module-based standard for writing stories, with a `.tsx` file extension.
- If you need to wrap a component in order to use hooks, etc., you can use [decorators](https://storybook.js.org/docs/react/writing-stories/decorators).
  - From a decorator, make sure you return `Story(props)` instead of `<Story {…props}/>` or else you’ll see `<No Display Name />` in the code preview tab.
  - To access given props from your template, use the [second “context” argument](https://github.com/linode/manager/pull/8060/files#diff-c7a7ccf5bc5311daaff07fd6fd33a40e4e73a06b4df8a337f9ce94f0577fdceeR13) in the template function.
- Mocking data/API calls can be tricky, and the solution may be component-dependent.
- MDX is unforgiving. Check the browser console for Storybook errors with syntax, imports, etc.
- Use the recommended Markdown and MDX VSCode plugins outlined in our [Coding Standards](./13-coding-standards.md).
