import {
  Disposable,
  TextEditorDecorationType,
  Range,
  TextEditor,
  TextDocument,
  TextDocumentChangeEvent
} from 'vscode';
import * as vscode from 'vscode';

import { dimOpacity } from './configurations';
import { mergeRanges } from './utils/mergeRanges';

type LineRange = [number, number];
type EditorRangesPair = [TextEditor, LineRange[]];

export class Highlighter {

  private _decorationType: TextEditorDecorationType | null = null;
  private _highlightedRanges: EditorRangesPair[] = [];

  private _disposables: Disposable[] = [];

  constructor() {
    this._createDecorationType();

    const that = this;
    this._disposables.push(
      vscode.workspace.onDidCloseTextDocument((document) => {
        that._onDidCloseTextDocument(document);
      })
    );
    this._disposables.push(
      vscode.workspace.onDidChangeTextDocument((change) => {
        that._onDidChangeTextDocument(change);
      })
    );
    this._disposables.push(
      vscode.workspace.onDidChangeConfiguration(() => {
        that._onDidChangeConfiguration();
      })
    );
  }

  dispose() {
    this._decorationType?.dispose();
    this._disposables.forEach(d => d.dispose());
  }

  public highlightSelectedLines(editor: TextEditor) {
    const ranges = this._rangesForEditor(editor);
    for (const selection of editor.selections) {
      mergeRanges([selection.start.line, selection.end.line], ranges);
    }

    this._applyHighlights(editor, ranges);
  }

  public getHighlightedRanges(editor: TextEditor) {
    return this._rangesForEditor(editor);
  }

  public clearRanges(editor: TextEditor) {
    const ranges = this._rangesForEditor(editor);
    ranges.splice(0, ranges.length);

    this._applyHighlights(editor, ranges);
  }

  private _onDidCloseTextDocument(document: TextDocument) {
    this._highlightedRanges = this._highlightedRanges.filter(e => {
      if (e[0].document === document) {
        return false;
      }
      return true;
    });
  }

  private _onDidChangeTextDocument(change: TextDocumentChangeEvent) {
    this._highlightedRanges.forEach(e => {
      if (e[0].document === change.document) {
        const ranges = e[1];
        ranges.splice(0, ranges.length);

        this._applyHighlights(e[0], ranges);
      }
    });
  }

  private _onDidChangeConfiguration() {
    this._createDecorationType();

    // re-apply highlights for all the editors
    this._highlightedRanges.forEach(e => {
      this._applyHighlights(e[0], e[1]);
    });
  }

  private _createDecorationType() {
    if (this._decorationType) {
      this._decorationType.dispose();
    }

    this._decorationType =
    vscode.window.createTextEditorDecorationType({
      opacity: '' + dimOpacity.get()
    });
  }

  private _rangesForEditor(editor: TextEditor): LineRange[] {
    for (const entry of this._highlightedRanges) {
      if (entry[0] === editor) {
        return entry[1];
      }
    }

    const newEntry: EditorRangesPair = [editor, <LineRange[]>[]];
    this._highlightedRanges.push(newEntry);

    return newEntry[1];
  }

  private _applyHighlights(editor: TextEditor, ranges: LineRange[]) {
    if (!this._decorationType) {
      // TODO: error handling
      return;
    }

    const document = editor.document;
    const dimmedRanges: Range[] = [];
    let lastRangeStartLine = 0;

    function rangeOfLineRange(start: number, end: number): Range {
      const lineStartPosition = document.lineAt(start).range.start;
      const lineEndPosition = document.lineAt(end).range.end;

      return new Range(lineStartPosition, lineEndPosition);
    }

    for (const range of ranges) {
      const rangeStart = range[0];
      const rangeEnd = range[1];
      if (lastRangeStartLine < rangeStart) {
        const range = rangeOfLineRange(lastRangeStartLine, rangeStart - 1);
        dimmedRanges.push(range);
      }

      lastRangeStartLine = rangeEnd + 1;
    }

    if (ranges.length && lastRangeStartLine < document.lineCount) {
      const lastRange = rangeOfLineRange(lastRangeStartLine, document.lineCount - 1);
      dimmedRanges.push(lastRange);
    }

    editor.setDecorations(this._decorationType, dimmedRanges);
  }

}
