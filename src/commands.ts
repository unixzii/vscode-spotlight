import * as vscode from 'vscode';
import { Selection } from 'vscode';

import { getContext } from './context';
import { dimOpacity } from './configurations';

const QUICK_ACTION_JUMP = 1;
const QUICK_ACTION_ADD = 2;

interface IQuickAction {
  type: number,
  [key: string]: any
}

export interface ICommand {
  identifier: string,
  handler: (...args: any[]) => any
}

export const focusOnSelectedLines: ICommand = {
  identifier: 'spotlight.focusOnSelectedLines',
  handler() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor.');
      return;
    }

    getContext().highlighter?.highlightSelectedLines(editor);
  }
};

export const showHighlightedRanges: ICommand = {
  identifier: 'spotlight.showHighlightedRanges',
  async handler() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor.');
      return;
    }

    const highlighter = getContext().highlighter;
    if (!highlighter) {
      return;
    }

    const ranges = highlighter.getHighlightedRanges(editor);
    if (!ranges) {
      return;
    }

    const document = editor.document;

    const lines = ranges.map(r => document.lineAt(r[0]));
    const menuItems = lines.map(l => ({
      label: `${l.lineNumber + 1}`,
      description: l.text,
      action: <IQuickAction>{
        type: QUICK_ACTION_JUMP,
        lineNumber: l.lineNumber
      }
    }));
    menuItems.unshift({
      label: '$(eye-watch)',
      description: 'Add the Selection to Focus Range',
      action: {
        type: QUICK_ACTION_ADD
      }
    });

    const selection = await vscode.window.showQuickPick(
      menuItems,
      {
        matchOnDescription: true,
        matchOnDetail: true,
        canPickMany: false
      }
    );

    if (!selection) {
      return;
    }

    switch (selection.action.type) {
      case QUICK_ACTION_ADD:
        highlighter.highlightSelectedLines(editor);
        break;
      case QUICK_ACTION_JUMP:
        const selectedLineNumber = <number>selection.action.lineNumber;
        const selectedLine = document.lineAt(selectedLineNumber);
        editor.revealRange(selectedLine.range);
        editor.selection = new Selection(selectedLine.range.start, selectedLine.range.start);
        break;
    }
  }
};

export const clearRanges: ICommand = {
  identifier: 'spotlight.clearRanges',
  handler() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor.');
      return;
    }

    getContext().highlighter?.clearRanges(editor);
  }
};

export const changeDimOpacity: ICommand = {
  identifier: 'spotlight.changeDimOpacity',
  async handler() {
    const currentValue = '' + dimOpacity.get();

    function parseValue(value: string): number | null {
      const parsedValue = Number.parseFloat(value);
        if (Number.isNaN(parsedValue) || parsedValue < 0 || parsedValue > 1) {
          return null;
        }
        return parsedValue;
    }

    const newValue = await vscode.window.showInputBox({
      value: currentValue,
      valueSelection: [2, currentValue.length],
      placeHolder: '0.0 - 1.0',
      validateInput(value) {
        if (parseValue(value) === null) {
          return 'Please input a valid opacity (0.0 - 1.0).';
        }
        return undefined;
      }
    });

    if (!newValue) {
      return;
    }

    const parsedValue = parseValue(newValue);
    if (parsedValue !== null) {
      dimOpacity.set(parsedValue);
    }
  }
};
