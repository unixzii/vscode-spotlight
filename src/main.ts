import { ExtensionContext } from 'vscode';
import { getContext } from './context';

export function activate(context: ExtensionContext) {
  getContext().extensionOnActivate(context);
}
