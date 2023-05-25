# Component Structure

Components are the basic building blocks of the Cloud Manager UI. Many components are atomic and reusable, appearing in many places across the app (e.g. `<Button />`), while others act as layouts or containers, managing state and routes for entire sections of the app (e.g. `<LinodesLanding />`).

The basic structure of a component file should follow:

```
[ imports ]
[ types and interfaces ]
[ function component definition ]
[ styles ]
[ utility functions ]
[ default export ]
```

Here is a minimal code example demonstrating the basic structure of a component file:

```tsx
import * as React from "react";
import { styled } from "@mui/material/styles";
import { isPropValid } from "src/utilities/isPropValid";

interface SayHelloProps {
  name: string;
  isDisabled: boolean;
}

const SayHello = (props: SayHelloProps) => {
  const { name, isDisabled } = props;

  return <StyledH1 isDisabled={isDisabled}>Hello, {capitalize(name)}</StyledH1>;
};

const StyledH1 = styled("h1", {
  label: "StyledH1",
  shouldForwardProp: (prop) => isPropValid(["isDisabled"], prop),
})(({ theme, ...props }) => ({
  color: props.isDisabled ? theme.color.grey : theme.color.black,
}));

export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export { SayHello };
```

- There are cases where you don't want the prop to be forwarded to the DOM element, so we've provided a helper `isPropValid` to assist in these cases.
- The `label` property in the `styled` API is used to provide a unique identifier for the component when it is being styled. This can be useful when debugging a large codebase, as it can help identify which component the style is being applied to. For example, if you have multiple instances of the `StyledH1` component, the `label` property can help you identify which instance is being styled in the browser's developer tools.

#### Imports

- Import React with `import * as React from 'react'`.
- Use absolute imports, e.g. `import { queryClient } from 'src/queries/base'`.
- Methods from the api-v4 package should be imported from `@linode/api-v4/lib/..`.

#### Styles

- With the transition to MUI v5, the [`styled`](https://mui.com/system/styled/) API, along with the [`sx` prop](https://mui.com/system/getting-started/the-sx-prop/), is the preferred way to specify component-specific styles.
  - Component-specific styles may be defined at the end of the component file or in a dedicated file, named `ComponentName.styles.tsx`.
  - Component files longer than 100 lines must have these styles defined in a dedicated file.

#### Types and Interfaces

- To specify component props, define an interface with the name of the component `MyComponentProps` and pass it to the component as a type argument. This is to provide clarity if ever we need to export this type into another component.
```
export const interface MyComponentProps {
  name: string;
}
const MyComponent = (props: MyComponentProps) { ... }
```
- When it comes to components located in the /features/ directory, you can use the name `Props` for their types or interfaces, unless exporting is necessary. In such cases, name the type or interface after the component name.
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
