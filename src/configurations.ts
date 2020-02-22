import * as vscode from 'vscode';

function makeAccessor<T>(key: string) {
  function root() {
    return vscode.workspace.getConfiguration('spotlight');
  }
  return {
    get() { return root().get(key); },
    set(val: T) { root().update(key, val, true); }
  };
}

export const dimOpacity = makeAccessor<number>('dimOpacity');;
