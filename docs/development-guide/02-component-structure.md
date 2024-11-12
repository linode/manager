# Component Structure

Components are the basic building blocks of the Cloud Manager UI. Many components are atomic and reusable, appearing in many places across the app (e.g. `<Button />`), while others act as layouts or containers, managing state and routes for entire sections of the app (e.g. `<LinodesLanding />`).

The basic structure of a component file should follow:

```
[ imports ]
[ types and interfaces ]
[ exported function component definition ]
[ styles ] (possibly in their own file)
[ utility functions ] (possibly in their own file)
```

Here is a minimal code example demonstrating the basic structure of a component file:

```tsx
import { omittedProps } from "@linode/ui";
import { styled } from "@mui/material/styles";
import * as React from "react";

// If not exported, it can just be named `Props`
export interface SayHelloProps {
  name: string;
  isDisabled: boolean;
}

export const SayHello = (props: SayHelloProps) => {
  const { name, isDisabled } = props;

  return <StyledH1 isDisabled={isDisabled}>Hello, {capitalize(name)}</StyledH1>;
};

/**
 * Should be moved to SayHello.styles.ts if component was large (> 100 lines).
*/
const StyledH1 = styled("h1", {
  label: "StyledH1",
  shouldForwardProp:  omittedProps(["isDisabled"]),
})(({ theme, ...props }) => ({
  color: props.isDisabled ? theme.color.grey : theme.color.black,
}));

/**
* It's often a good idea to move utilities to their own files as well,
* either in the `src/utilities` directory if meant to be portable and reusable,
* or in the feature's directory as a .utils.ts file. ex: `SayHello.utils.ts`.
* Isolation makes utils easier to test and reduces the main file size for better readability.
* Doing so also may also reveal the use case is already covered by an existing utility.
*/
export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};
```

#### Imports

- Import React with `import * as React from 'react'`.
- Use absolute imports, e.g. `import { queryClient } from 'src/queries/base'`.
- Methods from the api-v4 package should be imported from `@linode/api-v4/lib/..`.

#### Composition

When building a large component, it is recommended to break it down and avoid writing several components within the same file. It improves readability and testability. It is also best to avoid same-file render functions (e.g. `renderTableBody`), in favor of extracting the JSX into its own component. In addition to improved readability and testability, this practice makes components less brittle and more extensible.

Components should, in most cases, come with their own unit test, although they can be skipped if an e2e suite is covering the functionality.
Utilities should almost always feature a unit test.

#### Security

Consider whether the component is displaying data that may be sensitive, such as IP addresses or personal contact information. If so, make use of the `MaskableText` component or `masked` property of the `CopyTooltip` to hide this data for users who choose to 'Mask Sensitive Data' via Profile Settings.

#### Styles

- With the transition to MUI v5, the [`styled`](https://mui.com/system/styled/) API, along with the [`sx` prop](https://mui.com/system/getting-started/the-sx-prop/), is the preferred way to specify component-specific styles.
  - Component-specific styles may be defined at the end of the component file or in a dedicated file, named `ComponentName.styles.ts`.
  - Component files longer than 100 lines must have these styles defined in a dedicated file.

##### Styled Components
- The `label` property in the `styled` API is used to provide a unique identifier for the component when it is being styled. This can be useful when debugging a large codebase, as it can help identify which component the style is being applied to. For example, if you have multiple instances of the `StyledH1` component, the `label` property can help you identify which instance is being styled in the browser's developer tools.
- There are cases where you don't want the prop to be forwarded to the DOM element, so we've provided a helper `omittedProps` to assist in these cases.
It is the responsibility of the developer to check for any console error in case non-semantic props make their way to the dom.

#### Types and Interfaces

- To specify component props, define an interface with the name of the component `MyComponentProps` and pass it to the component as a type argument. This is to provide clarity if ever we need to export this type into another component.
```
export const interface MyComponentProps {
  name: string;
}
const MyComponent = (props: MyComponentProps) { ... }
```
- When it comes to components located in the `src/features/` directory, you can use the name `Props` for their types or interfaces, unless exporting is necessary. In such cases, name the type or interface after the component name.
- Define props as required, rather than optional, as often as possible for data relying on API responses (which can be `undefined`). In the case of `undefined` props, error handling - such as early return statements - can be done in the HOC. This allows all child components to expect data, avoiding extra conditionals or convoluted logic.

#### Function Component Definition

- Prefer function components over class components.
  - Almost all new components in the repository are function components, though legacy class components are still present.
- Use capital naming conventions for JSX elements used within a component.
  - Example: `const ActionsElement = (<Button> Example </Button>)`.
- If a prop accepts only JSX elements, capitalize the prop name.
  - Example: `<MyComponent Actions={ActionsElement}>`.

#### Utility Functions

- Utility functions in use by _this component only_ should go here
- Before composing a utility function, check to see if it already exists in `src/utilities`.

#### Default Export

- You should use named exports when exporting a component:
  - e.g. `export { MyComponent }`
