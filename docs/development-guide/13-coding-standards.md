# Coding Standards

## Linting

We use [ESLint](https://eslint.org/) to enforce coding and formatting standards. The config is found at `packages/manager/.eslintrc.js`. We also use several plugins to extend linting features; here are just a few:

- **@typescript-eslint** (TypeScript-specific rules)
- **markdownlint** (Markdown-specific rules)
- **MDX** (MDX-specific rules)
- **jsx-a11y** (accessibility)
- **prettier** (code formatting)
- **scanjs** (security)

If you are using VSCode it is highly recommended to use the ESlint extension. The Prettier extension is also recommended, as it can be configured to format your code on save.

## React

- When conditionally rendering JSX, use ternaries instead of `&&`.
  - Example: `condition ? <Component /> : null` instead of `condition && <Component />`
  - This is to avoid hard-to-catch bugs ([read more](https://kentcdodds.com/blog/use-ternaries-rather-than-and-and-in-jsx)).

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

## Adobe Analytics

### Writing a Custom Event

Custom events live (mostly) in `src/utilities/analytics.ts`. Try to write and export custom events in this file if possible, and import them in the component(s) where they are used.

```tsx
// Component.tsx {file(s) where the event is called, for quick reference}
// OtherComponent.tsx

sendDescriptiveNameEvent () => {
      category: '{Descriptive/Page Name}',
      action: '{interaction such as Click, Hover, Focus}:{input type such as button, link, toggle, checkbox, text field} e.g. Click:link',
      label: '{string associated with the event; e.g event label} (optional)',
      value: '{number associated with the event; e.g. size of a volume} (optional)',
}
```

When adding a new custom event, coordinating with UX on the event's `category`, `action`, `label`, and `value` props values ensures consistency across our data.

Avoid including pipes (`|`) as delimiters in any of the event properties. They are used in Adobe Analytics to separate fields.

Avoid creating custom events that collect such as search queries, entity names, or other forms of user input. Custom events can still be fired on these actions with a generic `label` or no label at all.

Examples

- `sendMarketplaceSearchEvent` fires when selecting a category from the dropdown (`label` is predefined) and clicking the search field (a generic `label` is used).
- `sendBucketCreateEvent` sends the region of the bucket, but does not send the bucket label.

### Locally Testing Page Views & Custom Events and/or Troubleshooting

1. Set the `REACT_APP_ADOBE_ANALYTICS_URL` environment variable in `.env`.
2. Use the browser tools Network tab, filter requests by "adobe", and check that successful network requests have been made to load the launch script and its extensions.
3. In the browser console, type `_satellite.setDebug(true)`.
4. Refresh the page. You should see Adobe debug log output in the console. Each page view change or custom event that fires should be visible in the logs.
