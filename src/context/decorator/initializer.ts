import { ContextRoot } from '@lit/context';

let root: ContextRoot | null = null;

/**
 * Problem with StencilJS is that connected callback is
 * invoked from slot child to parent.
 *
 * Therefore, we need to make sure that context root is
 * initialized before any component is connected to DOM.
 *
 * This function is called from the decorators to ensure
 * that context root is initialized.
 *
 * {@internal}
 */
export function initialize(): void {
    if (null !== root) {
        return;
    }

    root = new ContextRoot();
    root.attach(document.body);
}