import { ComponentInterface } from '@stencil/core';

type Interface<T> = {
    [K in keyof T]: T[K];
};

type DecoratorReturn = void | any;

type FieldMustMatchProvidedType<Obj, Key extends PropertyKey, ProvidedType> =
// First we check whether the object has the property as a required field
    Obj extends Record<Key, infer ConsumingType>
        ? // Ok, it does, just check whether it's ok to assign the
        // provided type to the consuming field
        [ProvidedType] extends [ConsumingType]
            ? DecoratorReturn
            : {
                message: 'provided type not assignable to consuming field';
                provided: ProvidedType;
                consuming: ConsumingType;
            }
        : // Next we check whether the object has the property as an optional field
        Obj extends Partial<Record<Key, infer ConsumingType>>
            ? // Check assignability again. Note that we have to include undefined
            // here on the consuming type because it's optional.
            [ProvidedType] extends [ConsumingType | undefined]
                ? DecoratorReturn
                : {
                    message: 'provided type not assignable to consuming field';
                    provided: ProvidedType;
                    consuming: ConsumingType | undefined;
                }
            : // Ok, the field isn't present, so either someone's using consume
            // manually, i.e. not as a decorator (maybe don't do that! but if you do,
            // you're on your own for your type checking, sorry), or the field is
            // private, in which case we can't check it.
            DecoratorReturn;


type FieldMustMatchContextType<Obj, Key extends PropertyKey, ContextType> =
// First we check whether the object has the property as a required field
    Obj extends Record<Key, infer ProvidingType>
        ? // Ok, it does, just check whether it's ok to assign the
        // provided type to the consuming field
        [ProvidingType] extends [ContextType]
            ? DecoratorReturn
            : {
                message: 'providing field not assignable to context';
                context: ContextType;
                provided: ProvidingType;
            }
        : // Next we check whether the object has the property as an optional field
        Obj extends Partial<Record<Key, infer Providing>>
            ? // Check assignability again. Note that we have to include undefined
            // here on the providing type because it's optional.
            [Providing | undefined] extends [ContextType]
                ? DecoratorReturn
                : {
                    message: 'providing field not assignable to context';
                    context: ContextType;
                    consuming: Providing | undefined;
                }
            : // Ok, the field isn't present, so either someone's using provide
            // manually, i.e. not as a decorator (maybe don't do that! but if you do,
            // you're on your own for your type checking, sorry), or the field is
            // private, in which case we can't check it.
            DecoratorReturn;

export type ConsumeDecorator<ValueType> = {
    // legacy
    <
        K extends PropertyKey,
        Proto extends Interface<ComponentInterface>,
    >(
        protoOrDescriptor: Proto,
        name?: K,
    ): FieldMustMatchProvidedType<Proto, K, ValueType>;

    // standard
    <
        C extends Interface<ComponentInterface>,
        V extends ValueType,
    >(
        value: ClassAccessorDecoratorTarget<C, V>,
        context: ClassAccessorDecoratorContext<C, V>,
    ): void;
};

export type ProvideDecorator<ContextType> = {
    // legacy
    <
        K extends PropertyKey,
        Proto extends Interface<ComponentInterface>,
    >(
        protoOrDescriptor: Proto,
        name?: K,
    ): FieldMustMatchContextType<Proto, K, ContextType>;

    // standard
    <
        C extends Interface<ComponentInterface>,
        V extends ContextType,
    >(
        value: ClassAccessorDecoratorTarget<C, V>,
        context: ClassAccessorDecoratorContext<C, V>,
    ): void;
};