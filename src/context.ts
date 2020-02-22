import { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';

import { ICommand, focusOnSelectedLines, showHighlightedRanges, clearRanges, changeDimOpacity } from './commands';
import { Highlighter } from './highlighter';

class Context {
  
  private _vscodeContext: ExtensionContext | null;
  private _highlighter: Highlighter | null;

  constructor() {
    this._vscodeContext = null;
    this._highlighter = null;
  }

  public get highlighter() {
    return this._highlighter;
  }

  public extensionOnActivate(vscodeContext: ExtensionContext) {
    this._vscodeContext = vscodeContext;
    
    const that = this;
    vscodeContext.subscriptions.push({
      dispose() {
        that._highlighter?.dispose();
        that._highlighter = null;
        that._vscodeContext = null;
      }
    });

    this._highlighter = new Highlighter();

    this._registerCommand(focusOnSelectedLines);
    this._registerCommand(showHighlightedRanges);
    this._registerCommand(clearRanges);
    this._registerCommand(changeDimOpacity);
  }

  private _registerCommand(command: ICommand) {
    if (!this._vscodeContext) {
      return;
    }

    const disposable = vscode.commands.registerCommand(
      command.identifier,
      command.handler
    );
    this._vscodeContext.subscriptions.push(disposable);
  }

}

let context: Context | null = null;

export function getContext(): Context {
  if (context == null) {
    context = new Context();
  }
  return context;
}
