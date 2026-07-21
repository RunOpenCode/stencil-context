# Context protocol

This library is implementation of
the [Context protocol](https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md) for
Stencil.

Implementation is based on the [Lit context protocol](https://github.com/lit/lit/tree/main/packages/context), where
portions of codes are copied and modified to work with Stencil, or reused as is.

License from the Lit context protocol is included in this repository, make sure it is compliant with your project
license (see original [LICENSE](https://github.com/lit/lit/blob/main/packages/context/LICENSE)).

## Installation

```bash
npm install @stencil/context-protocol
```

## Initialization

Due to the way Stencil works, you need to initialize the context protocol before using it. Order of the initialization
of the Stencil components is from bottom to top, so providers are initialized after consumers, which is not what we
want. To fix this, you need to invoke `initializeContext()` function.

This invocation must be done once, prior to the initialization of any Stencil component.

There are various methods to do this, the easiest one is to
use [global script](https://stenciljs.com/docs/config#globalscript) in Stencil configuration. Basically, you will create
a global script file, and in that file you will invoke `initializeContext()` function. When you import your components
in your application, the global script will be executed first, and context protocol will be initialized.

Initialization script will expose `provideContext()` and `createContext()` functions globally, however, you may disable
this behavior by passing `false` to the `initializeContext()` function.

Example:

```ts
import { initializeContext } from '@runopencode/stencil-context';

initializeContext();
```

## Usage

It is assumed that you have a basic understanding of Stencil and how to create components, and you have understood the
context protocol. Concept is same as in Lit, React, Vue, etc. You can provide a context value in a parent component and
consume it in a child component.

Two decorators are provided to implement the context protocol:

- `@Provide(context: Context|string)` - to provide a context value to the subtree of the component.
- `@Consume(context: Context|string, subscribe: boolean = false)` - to consume a context value from the subtree of the
  component. If `subscribe` is set to `true`, the component will get new context value when the context value from
  provider changes. That means that provider may change the context value and subscribed consumers will be notified.

Context identifier may be a string or a `Context` identifier, which you can create using
`createContext<ValueType, K = unknown>(key: K)` function (see [Lit documentation](https://lit.dev/docs/data/context)).
If you provide a string as context identifier, it will be converted to a `Context` identifier internally.

Decorators may be used in component property, with or without `@State()` or `@Prop()` decorator. If you use `@State()`
or `@Prop()` decorator, the component will re-render when the context value changes.

## Global providers

You can provide a context value globally, so that all components in the application can consume it. To do this, you may
utilize `provideContext(context, value, element = null)` function. If you don't provide element, the context value will
be provided from `body` element.

General idea is to avoid slot flickering when rendering provider components, especially when its being used in server
side rendered applications.

Example:

```html
<!DOCTYPE html>
<html dir='ltr' lang='en'>
<head>
    <script type="module">
        import {defineCustomElements} from '/my-components/loader/index.js';

        defineCustomElements();
    </script>
</head>
<body>
<script type='module'>
    provideContext('logger', { log: (value) => console.log(`[LOG] ${value}`) });
</script>
</body>
</html>
```

Component consuming the context value:

```tsx
import { Component, ComponentInterface, h } from '@stencil/core';
import { Consume } from '@stencil/context-protocol';

@Component({
    tag: 'my-component',
})
export class MyComponent implements ComponentInterface {

    @Consume('logger', true)
    public logger: { log: (value: string) => void };

    public componentWillLoad(): void {
        this.logger.log('Component will load.');
    }
}
```

## TODO

- [ ] Test suite for context protocol implementation.

## Thanks

- [Lit](https://lit.dev) and provided implementation of context protocol.
