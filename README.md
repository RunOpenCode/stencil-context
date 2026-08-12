# Context protocol

This library is implementation of
the [Context protocol](https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md) for
Stencil.

Implementation is based on the [Lit context protocol](https://github.com/lit/lit/tree/main/packages/context), where some
of the portions of codes are copied and modified to work with Stencil.

## What is this for?

Context protocol is a way to provide and consume values in a component tree without having to pass them down through
props. Basically, **it solves the problem of prop drilling**. It is not a solution for state management, but it can be
used to implement it. It is a specific method of implementation of hierarchical **service locator** pattern in context
of DOM tree.

It is not a new thing, it is already implemented in many frameworks, such as React, Vue, Angular, etc., except, in
context of web components and Stencil (as well as Lit), implementation approach is through events, which is more
suitable for web components, and it is more aligned with the DOM tree.

There are workarounds to achieve similar functionality, such as using
`element.closest('my-component-provider').someProperty`, however, this assumes that child component is aware of the
parent component. Context protocol inverts control, so that child component is not aware of the parent component, and it
can consume context value from any ancestor which provides required dependency.

## Installation

```bash
    npm install @stencil-community/context
```

## Initialization

There is no specific initialization required for the context protocol. However, there are certain cases in which you may
want to initialize context root before any Stencil component is initialized. There are two use cases for which you may
need to initialize context root.

- New providers are being added to the DOM dynamically, after consumers are already initialized. See more from Lit
  documentation here: [Dynamic providers](https://lit.dev/docs/data/context/#contextroot).
- Components are used on standard, server side rendered HTML page, as enhancement for UI. Order of component
  initialization in that case is not guaranteed due to lazy loading of Stencil components (unless you are using
  `dist-custom-elements`, see more [here](https://stenciljs.com/docs/custom-elements)). In that case, race condition may
  occur, where consumers are initialized before providers, and they will not be able to consume context values. Context
  root initialization will prevent this from happening.

There are various methods to do this, the easiest one is to
use [global script](https://stenciljs.com/docs/config#globalscript) in Stencil configuration. Basically, you will create
a global script file, and in that file you will invoke `createContextRoot()` function. When you import your components
in your application, the global script will be executed first, and context root will be initialized before any component
is initialized making sure that pending consume requests will be satisfied, eventually, when provider is initialized.

Example:

```ts
// file: src/global.ts
import { createContextRoot } from '@stencil-community/context';

export default function initialize(): void {
    createContextRoot();
}
```

**NOTE**: _Lit implementation of context root requires that consumer wants to subscribe to context value changes in
order to provide missing context value when provider is initialized. In Stencil implementation, this is not required,
and consumer will get context value either way. This deviation is deliberate, as Stencil, due to lazy loading, uses
proxies until components are fully loaded which can lead to race conditions in non-stencil application context. This
does not violate the context protocol, as it is not specified in the protocol how to handle this situation, and it is up
to implementation to decide how to handle it._

## Usage

It is assumed that you have a basic understanding of Stencil and how to create components, and you have understood the
context protocol. Concept is same as in Lit, React, Vue, etc. You can provide a context value in a parent component and
consume it in a child component.

Two decorators are provided to implement the context protocol:

- `@Provide(context: Context|string)` - to provide a context value to the subtree of the component.
- `@Consume(context: Context|string, options: { subscribe?: boolean, unprovided?: 'ignore' | 'wait' | 'error' })` - to
  consume a context value from the subtree of the component.

Context identifier may be a string or a `Context` identifier, which you can create using
`createContext<ValueType, K = unknown>(key: K)` function (see [Lit documentation](https://lit.dev/docs/data/context)).
If you provide a string as context identifier, it will be converted to a `Context` identifier internally. This deviation
is deliberate, as it is more convenient to use string identifiers in some cases, especially as service locator for
globally provided values. Per example, logger service (`@app.logger`), theme service (`@app.theme`), etc.

For consumer, two options are provided:

- `subscribe` - if set to `true`, the consumer value will be updated when the context value changes. If this requires
  re-render of the component, you should annotate property with `@State()` or `@Prop()` decorator. Default is `false`.
- `unprovided` - if set to `ignore`, the consumer will not throw an error if the context value is not provided prior to
  `componentWillLoad()` lifecycle hook. If set to `wait`, the consumer component will not trigger `componentWillLoad()`
  lifecycle hook until the context value is provided. If set to `error`, the consumer will throw an error if the context
  value is not provided prior to `componentWillLoad()` lifecycle hook. Default is `ignore`.

### Examples

```tsx
import { Component, ComponentInterface, FunctionalComponent, h } from '@stencil/core';
import { Provide, Consume } from '@stencil-community/context';

export class Logger {
    public log(value: string): void {
        console.log(`[LOG] ${value}`);
    }
}

export const loggerContext = createContext<Logger>('logger');

@Component({
    tag: 'provider-component',
})
export class ProviderComponent implements ComponentInterface {

    @Provide(loggerContext)
    public logger: Logger = new Logger();

    public render(): any {
        return <slot />;
    }
}

@Component({
    tag: 'consumer-component',
})
export class ConsumerComponent implements ComponentInterface {

    @Consume(loggerContext, {
        subscribe: true,
        unprovided: 'wait',
    })
    public logger: Logger;

    public componentWillLoad(): void {
        this.logger.log('Component will load.');
    }

    public render(): any {
        return <div>Consumer component</div>;
    }
}

export const App: FunctionalComponent = () => {
    return (
            <provider-component>
                <consumer-component />
            </provider-component>
    );
};
```

## Utility functions.

There are several utility functions which you may use to provide context values globally, or to consume context values.

- `createContext()`: Create context identifier. You can use this identifier to provide and consume context values.
- `provideContext(context: Context | string, value: ValueType, target: HTMLElement | string | null = null): void`:
  Provide context value to the subtree of the target element. If target is `null`, context value will be provided
  globally, from `document.documentElement` element (`<html>`). If target is a string, it will be used as a CSS selector
  to find the target element. This is especially useful for providing context values globally, per example, a global
  logger service, theme service, etc.
- `consumeContext(context: Context | string, target: HTMLElement | string | null = null): Promise<unknown>`:
  Consume context value from the ancestor of the target element. If target is `null`, context value will be consumed
  from `document.body` element (`<body>`). If target is a string, it will be used as a CSS selector to find the target
  element. This is especially useful for consuming context values programmatically, when needed.
- `createContextRoot()` and `removeContextRoot()`: Create and remove context root. Context root is a special element
  which is used for reconciliation of pending consume requests when provider is initialized after consumer. It can be
  created globally, or per subtree of the component tree.

## Quirks

There are some quirks in the implementation of context protocol in Stencil when it comes to lazy loading of components
and when provided value will be available or not. Let's assume that we have two components, `provider-component` and
`consumer-component`. Provider component provides context which is required by consumer component. In the context of
Stencil component that wraps Stencil components, as in example below:

```tsx
export const App: FunctionalComponent = () => {
    return (
            <provider-component>
                <consumer-component />
            </provider-component>
    );
};
```

consumer component will have provided context value from provider component available from the `connectedCallback()`
lifecycle hook and so on. However, if you are using Stencil components in a non-Stencil application (plain HTML page),
even if you are setting global context root, context value will be available in consumer component only from the
`componentWillLoad()` lifecycle hook and so on.

In that matter, general advice for designing components is to utilize provided context values in `componentWillLoad()`
lifecycle hook (or any other hooks that comes after it) in order to make your components portable and usable 
in Stencil and non-Stencil applications.

## TODO

- [ ] Discussion: Should context root stop propagation of context events? Should that be a flag?
- [ ] Discussion: Should global context root be created automatically when first provider or consumer is initialized?

## Thanks

- [Lit](https://lit.dev) and provided implementation of context protocol.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

- Removed `@lit/context` as dependency, as it is not needed anymore. Source code diverged too much from Lit
  implementation, only events and some of the types are unchanged and those are defined by the context protocol
  specification.
