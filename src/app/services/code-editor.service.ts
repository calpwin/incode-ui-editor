import { currentMediaSelector } from './../ngrx/selectors/space.selectors';
import { MediaType } from './../ngrx/store/space-media';
import { HtmlCElement } from './models/html-celement';
import { AppConstants } from './app.constant';
import { AppState, KeyValuePairModel } from '../ngrx/store/initial.state';
import { HtmlCElementService } from './html-celement.service';
import {
  CustomElement,
  NewCustomElement,
} from '../ngrx/store/custom-element.state';
import { Inject, Injectable } from '@angular/core';
import * as htmlparser from 'htmlparser2';
import * as serializer from 'dom-serializer';
import { Document as DomDocument, Element } from 'domhandler';
import { DOCUMENT } from '@angular/common';

import * as csstree from 'css-tree';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root',
})
export class CodeEditorService {
  private _doc!: DomDocument;
  private _css!: csstree.CssNode;

  private readonly _cels = new Map<string, CustomElement>();

  private _currentMedia = MediaType.None;

  constructor(
    @Inject(DOCUMENT) private readonly _document: Document,
    private readonly _htmlCElementService: HtmlCElementService,
    private readonly _store: Store<AppState>
  ) {
    this.bindServiceEvents();
  }

  bindServiceEvents() {
    this._store
      .select(currentMediaSelector)
      .subscribe((media) => (this._currentMedia = media));
  }

  syncEditorStyles() {
    const updatedHelms = this._htmlCElementService.getElements(false);

    updatedHelms.forEach(helm => {
      this.addCssRules(helm.cel.id, helm.cel.styles);
    });
  }

  //#region Html

  parseHtml(html: string) {
    this._doc = htmlparser.parseDocument(html);
  }

  addElToDom(cel: NewCustomElement, spaceElId: string) {
    if (this._cels.has(cel.id)) {
      return;
    }

    this._cels.set(cel.id, { ...cel, styles: [...cel.styles] });

    const spaceEl = htmlparser.DomUtils.getElementById(
      spaceElId,
      this._doc.children
    );

    if (!spaceEl) {
      console.log(
        `Can not find space with id: ${spaceElId} will not add element to dom`
      );
      return;
    }

    htmlparser.DomUtils.appendChild(
      spaceEl,
      new Element(
        cel.tagName,
        { class: 'rittry-element', id: cel.id },
        undefined,
        htmlparser.ElementType.Tag
      )
    );
  }

  removeElFromDom(elId: string) {
    if (this._cels.has(elId)) this._cels.delete(elId);

    const el = htmlparser.DomUtils.getElementById(elId, this._doc.children)!;

    htmlparser.DomUtils.removeElement(el);
  }

  getHtml() {
    return serializer.default(this._doc.children);
  }

  //#endregion

  //#region Css

  parseCss(css: string) {
    this._css = csstree.parse(css);
  }

  addCssRules(celId: string, rules: KeyValuePairModel[]) {
    const onlyNewRules = this._cels.has(celId)
      ? this.syncRules(celId, rules)
      : rules;

    let foundIdSelector: csstree.CssNode | undefined = undefined;

    csstree.walk(this._css, {
      visit: 'Rule',
      leave(node, item, list) {
        if (foundIdSelector) return;

        foundIdSelector = csstree.find(
          node,
          (x) => x.type === 'IdSelector' && x.name === celId
        );

        if (!foundIdSelector) return;

        onlyNewRules.forEach((rule) => {
          const ruleNode = csstree.find(
            node,
            (x) => x.type === 'Declaration' && x.property === rule.name
          ) as csstree.Declaration;

          if (ruleNode) {
            ruleNode.value = { type: 'Raw', value: rule.value };
          } else {
            const blockNode = csstree.find(
              node,
              (x) => x.type === 'Block'
            ) as csstree.Block;

            const declaration = blockNode.children.createItem({
              type: 'Declaration',
              important: false,
              property: rule.name,
              value: { type: 'Raw', value: rule.value },
            });

            blockNode.children.append(declaration);
          }
        });
      },
    });

    if (!foundIdSelector && this._css.type === 'StyleSheet') {
      const addMediaClass =
        this._currentMedia !== MediaType.None
          ? '.' + AppConstants.getMediaCssClass(this._currentMedia) + ' '
          : '';

      const addRootElementClass =
        celId !== AppConstants.HtmlRootSpaceElementId
          ? '#' + AppConstants.HtmlRootSpaceElementId + ' '
          : '';

      const blockNode = this._css.children.createItem({
        type: 'Rule',
        block: { type: 'Block', children: new csstree.List<csstree.Block>() },
        prelude: {
          type: 'Raw',
          value: `${addMediaClass}${addRootElementClass}#${celId}.${AppConstants.HtmlElementClassName}`,
        },
      }) as csstree.ListItem<csstree.Rule>;

      blockNode.data.block.children.appendData({
        type: 'Raw',
        value: this.rulesToCss(onlyNewRules),
      });

      this._css.children.append(blockNode);
    }
  }

  getCss() {
    return csstree.generate(this._css);
  }

  private rulesToCss(rules: KeyValuePairModel[]) {
    let css = '';

    rules.forEach((rule) => {
      css += `${rule.name}:${rule.value};`;
    });

    return css;
  }

  /**
   * Sync with editor rules
   * @return only new rules to update in code
   */
  private syncRules(celId: string, rules: KeyValuePairModel[]) {
    const cel = this._cels.get(celId)!;

    const finalRules: KeyValuePairModel[] = [];

    rules.forEach((rule) => {
      const style = cel.styles.find((x) => x.name === rule.name);

      if (!style) {
        finalRules.push(rule);
        cel.styles.push(rule);
        return;
      }

      if (!style.equals(rule)) {
        finalRules.push(rule);
        style.value = rule.value;
        return;
      }
    });

    return finalRules;
  }

  //#endregion
}
