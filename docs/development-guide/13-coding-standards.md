# Coding Standards

## Linting

We use [ESLint](https://eslint.org/) to enforce coding and formatting standards. The config is found at `packages/manager/.eslintrc.js`. We also use several plugins to extend linting features; here are just a few:

- **@typescript-eslint** (TypeScript-specific rules)
- **markdownlint** (Markdown-specific rules)
- **MDX** (MDX-specific rules)
- **jsx-a11y** (accessibility)
- **prettier** (code formatting)
- **scanjs** (security)

If you are using VSCode it is **highly** recommended to use the [ESlint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint). The [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) is also recommended, as it can be configured to format your code on save.

## React
### useEffect()
`useEffect()` should only be used for handling true side effects - specifically API calls, subscriptions, and DOM mutations that must occur outside React's render cycle. While you may encounter instances where `useEffect()` is used differently throughout our existing codebase, we're actively working to remove those instances. Existing code that does not adhere to the hook's proper use should not be used as precedent for implementing new `useEffect()` instances. All state updates and data transformations should be handled through event handlers and direct state management.

When Not to Use Effects:
- Prop synchronization with state
- Derived state calculations
- Post-render state updates
- Props/state triggers for child components
- Chaining state updates

Reference: https://react.dev/learn/you-might-not-need-an-effect

### useId()
[Several new hooks were introduced with the release of React 18](https://react.dev/blog/2022/03/29/react-v18#new-hooks).

It should be noted that the `useId()` hook is particularly useful for generating unique IDs for accessibility attributes. For this use case, `useId()` is preferred over hardcoding the ID because components may be rendered more than once on a page, but IDs must be unique.

As an example from `DisplayLinodes.tsx`, early in the file we invoke the hook: `const displayViewDescriptionId = React.useId()`

And make use of the unique ID by passing it as the value for a component's `aria-describedby` attribute in the `return` value:

```
  <StyledToggleButton
  aria-describedby={displayViewDescriptionId}
  aria-label="Toggle display"
  disableRipple
  isActive={true}
  onClick={toggleLinodeView}
  size="large"
>
  <GridView />
</StyledToggleButton>
```

Per the [docs](https://react.dev/reference/react/useId#usage), the hook should not be used for generating keys in a list.

## Event Handler Naming Convention

In React, it's a convention to prefix prop names that hold event handler functions with `on`, such as `onClick`, `onSubmit`, `onFocus`, etc. This convention helps in maintaining consistency and readability across the codebase. By following this convention, we declare that these props will be used for event handler functions.

Similarly, when defining function names that handle events or perform some action, it's a convention to prefix them with `handle`. For example, if we have a component that handles a click event, we can define a function named `handleClick` that performs the desired action. This convention helps to distinguish between functions that handle events and other functions that perform different actions.

Example of prop naming:
```
<TextField onChange={handleInputChange} />
```
Example of function naming:
```
function handleInputChange(event) {...}
```

More complex names can be handled with the same convention:
```
API: {prefix}{noun}{verb}
Prop: onLabelChange
Function: handleLabelChange
```

## CSS

The styles for Cloud Manager are located in three places:

- `packages/manager/src/index.css` contains global styles, utility styles, and accessibility related styles.
- `packages/manager/src/foundations/themes/index.ts` contain code for modifying the default [Material UI](https://mui.com) styles and theme specific styles.
  - Light mode styles are located in `/foundations/themes/light.ts` and dark mode styles are located in `/foundations/themes/dark.ts`.
  - The breakpoints can be modified at `/foundations/breakpoints/index.ts`.
- Component-specific styles may be defined either at the end of the component file or in a dedicated file, named `ComponentName.styles.tsx`. Refer to the guidelines outlined in the "Styles" section of [Component Structure](02-component-structure.md#styles).

## Typescript Unions, Const Enums, Objects and Intersections
In our development process, we often encounter scenarios where we need to handle various messages or descriptions in our application. These messages can range from short, pithy statements to longer, more descriptive texts. To ensure a consistent and maintainable approach, we can use union types for lists of pithy data and const enums or plain old JavaScript objects (POJOs) for longer descriptions.

### Union Types for Pithy Data
When dealing with short and concise messages, like error notifications or status updates, using union types can provide a clean and easily understandable way to define the different message types. Union types allow us to define a value that can be one of several types. In this case, we can define a union type for pithy messages using string literals:

```
type CreateTypes = 'fromApp' | 'fromStackScript' | 'fromImage'
```

### Const Enums and POJOs for Longer Descriptions
For longer descriptions that require more context and detail, const enums or plain old JavaScript objects (POJOs) are more suitable. Both approaches provide a structured way to define and organize multiple messages while allowing for descriptive properties.

#### Const Enums Approach:
```
const enum NoOptionsMessage {
  Error = 'An error occurred while fetching your options',
  NoOptions = 'You have no options to choose from',
  NoResults = 'No results',
}
```
With const enums, we define a set of related constants with descriptive names and associated values. Const enums offer benefits primarily during compile-time rather than runtime. Unlike regular enums, const enums do not generate any JavaScript code during compilation. Instead, their values are inlined directly into the generated JavaScript code at compile-time.

#### POJOs Approach:
```
const NoOptionsMessage = {
  Error: 'An error occurred while fetching your options',
  NoOptions: 'You have no options to choose from',
  NoResults: 'No results',
} as const;
```
With POJOs, we create a read-only object using the `as const` assertion to ensure that the values cannot be modified after creation.

### Using Generics and typeof to Extract Values from as const Objects
In addition to utilizing const enums and POJOs for longer descriptions, we can further enhance our code's flexibility and type safety by extracting values from objects declared with `as const`. This can be achieved using generics and the `typeof` operator.
```
const CreateTypes = {
  App: 'fromApp',
  Stackscript: 'fromStackScript',
  Image: 'fromImage',
  Backup: 'fromBackup',
  Linode: 'fromLinode',
} as const;
```
We can define a generic type, `ObjectValues`, that accepts an object type and extracts its values using the `keyof` operator. This provides us with the flexibility to create union types from object values.
```
type ObjectValues<T> = T[keyof T];

// Union type: 'fromApp' | 'fromStackScript' | 'fromImage' | 'fromBackup' | 'fromLinode'
type LinodeCreateFrom = ObjectValues<typeof CreateTypes>;
```
In our specific case, we can use `ObjectValues<typeof CreateTypes>` to extract the values from the `CreateTypes` object.
By utilizing this approach, we ensure that the values passed to `myFunction` are limited to the possible values defined in the `CreateTypes` object. This enhances type safety and prevents accidental usage of incorrect values.
```
function myFunction(type: LinodeCreateFrom) {
  // Function implementation
}

myFunction(CreateTypes.Backup); // Works
myFunction('fromBackup'); // Works
```

### Preferring Interfaces Over Intersections

Much of the time, a simple type alias to an object type acts very similarly to an interface.

```Typescript
interface Foo { prop: string }

type Bar = { prop: string };
```

However, and as soon as you need to compose two or more types, you have the option of extending those types with an interface, or intersecting them in a type alias, and that's when the differences start to matter.

Interfaces create a single flat object type that detects property conflicts, which are usually important to resolve! Intersections on the other hand just recursively merge properties, and in some cases produce never. Interfaces also display consistently better, whereas type aliases to intersections can't be displayed in part of other intersections. Type relationships between interfaces are also cached, as opposed to intersection types as a whole. A final noteworthy difference is that when checking against a target intersection type, every constituent is checked before checking against the "effective"/"flattened" type.

For this reason, extending types with interfaces/extends is suggested over creating intersection types.

```Typescript
- type Foo = Bar & Baz & {
-     someProp: string;
- }
+ interface Foo extends Bar, Baz {
+     someProp: string;
+ }
```

Source: [TypeScript Wiki](https://github.com/microsoft/TypeScript/wiki/Performance#preferring-interfaces-over-intersections)
