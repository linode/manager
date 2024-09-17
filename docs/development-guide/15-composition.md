# Composition

## Page Composition
Composing pages in Cloud Manager is a multi-step process that involves several components and patterns. It usually involves using a combination of components already available to the developer, and organized according to the desired layout.

It is best to avoid one off components for pages, or an excessive amount of custom CSS. It is likely that a component already exists to handle the desired layout or styling. It is often a good idea to spend some time looking through the codebase, at [storybook](https://design.linode.com/) or an existing feature of Cloud Manager before making certain composition decisions. It is also important to compose with markup semanticity in mind, and keep an eye on the render tree to avoid bloating the layout with unnecessary containers, wrappers etc, as well as ensuring that the page is accessible, performant, and has good test coverage. When in doubt, one can also check with the product or UX team to ensure that a component exists for the desired layout or styling.

### Responsive Design

While Cloud Manager layout and components are responsive out of the box, some extra handling may be needed for pages that have unique responsive requirements, or because the features has a more complex layout.
A wide array of tools are available to help with responsive design, including media queries, CSS Grid & Flexbox, as well as the `<Hidden />` component, which can be used to hide elements at specific breakpoints.

Some designs may not feature a mobile layout, and for those cases it is recommended to gather existing examples from the codebase, or from other pages that have a similar layout.

## Form Composition

### Formik
Formik is now deprecated. Please use react-hook-form.

### React Hook Form
The preferred library for building forms in Cloud Manager is [react-hook-form](https://react-hook-form.com/). It is a complete set of tools for building complex forms, and is well documented.
The general way to get started is to use the `useForm` hook, which returns a form context and a set of methods to interact with the form.

```Typescript
const methods = useForm<LinodeCreateFormValues>({
  defaultValues,
  mode: 'onBlur',
  resolver: myResolvers,
  // other methods
});
```

`methods` is an object that contains the form context and a set of methods to interact with the form.
It is passed to the `FormProvider` component, which is a wrapper that provides the form context to the form.

```Typescript
<FormProvider {...methods}>
  <form onSubmit={methods.handleSubmit(onSubmit)}>
    {/* form fields */}
    <button type="submit">Submit</button>
  </form>
</FormProvider>
```

It is important to note that react-hook-form does not provide any UI components. It is the responsibility of the developer to provide the form fields and validation, as well as employing semantic markup for accessibility purposes.
ex: a `<form>` element should have a corresponding `<button type="submit">` element to submit the form so that it is obvious to assistive technologies that the form can be submitted via keyboard.

It is also important to remember to manage the form state through comprehensive context in order to avoid unnecessary rerenders.

The Linode Create Page is a good example of a complex form that is built using react-hook-form, using the best practices mentioned above.

### Uncontrolled Forms
Uncontrolled forms are a type of form that does not have a state for its values. It is often used for simple forms that do not need to be controlled, such as forms with a single input field or call to action.

