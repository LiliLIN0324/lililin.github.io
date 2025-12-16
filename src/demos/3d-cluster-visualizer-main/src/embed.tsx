import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App, { AppProps } from '../../../../App';
import './index.css';

const rootMap = new WeakMap<HTMLElement, Root>();

export type EmbedOptions = Partial<AppProps>;

export function mount(container: HTMLElement, options?: EmbedOptions) {
  if (!container) throw new Error('container element is required');
  if (rootMap.has(container)) return;
  const root = createRoot(container);
  const props: AppProps = { ...(options as AppProps), isEmbedded: true };
  root.render(<App {...props} />);
  rootMap.set(container, root);
}

export function unmount(container: HTMLElement) {
  const root = rootMap.get(container);
  if (root) {
    root.unmount();
    rootMap.delete(container);
  }
}

export default { mount, unmount };
