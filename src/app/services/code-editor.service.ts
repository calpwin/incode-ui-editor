import { MediaType } from './../ngrx/store/space-media';
import { AppConstants } from './app.constant';
import { AppState } from '../ngrx/store/initial.state';
import { HtmlCElementService } from './html-celement.service';
import { NewCustomElement } from '../ngrx/store/custom-element.state';
import { Inject, Injectable } from '@angular/core';
import * as htmlparser from 'htmlparser2';
import * as serializer from 'dom-serializer';
import { Document as DomDocument, Element } from 'domhandler';
import { DOCUMENT } from '@angular/common';

import * as csstree from 'css-tree';
import { Store } from '@ngrx/store';
import { KeyValuePairModel } from '../ngrx/store/element-style';

@Injectable({
  providedIn: 'root',
})
export class CodeEditorService {
  private _doc!: DomDocument;
  // private _css!: csstree.CssNode;
  private readonly _cssMap = new Map<MediaType, csstree.CssNode>();

  private readonly _domCelIds = new Set<string>();

  // private _celements = new Map<string, CustomElement>();
  // private _currentMedia = MediaType.None;

  constructor(
    @Inject(DOCUMENT) private readonly _document: Document,
    private readonly _htmlCElementService: HtmlCElementService,
    private readonly _store: Store<AppState>
  ) {
    this.bindServiceEvents();
  }

  bindServiceEvents() {
    // this._store
    //   .select(currentMediaSelector)
    //   .subscribe((media) => (this._currentMedia = media));

    // this._store.select(celementsSelector).subscribe((cels) => {
    //   const map = new Map<string, CustomElement>();
    //   cels.forEach((cel) => {
    //     map.set(cel.id, cel);
    //   });
    //   this._celements = map;
    // });
  }

  syncEditorStyles(media: MediaType) {
    const updatedHelms = this._htmlCElementService.getElements(false);

    updatedHelms.forEach((helm) => {
      // console.log(`${helm.cel.id} : ${helm.cel.mediaStyles.get(MediaType.None)?.map(x => `${x.name}:${x.value}`)}`);
      this.addCssRules(helm.cel.id, helm.cel.mediaStyles.getStyles(media), media);
    });
  }

  //#region Html

  parseHtml(html: string) {
    this._doc = htmlparser.parseDocument(html);
  }

  addElToDom(cel: NewCustomElement, spaceElId: string) {
    if (this._domCelIds.has(cel.id)) {
      return;
    }

    this._domCelIds.add(cel.id);

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
    if (this._domCelIds.has(elId)) this._domCelIds.delete(elId);

    const el = htmlparser.DomUtils.getElementById(elId, this._doc.children)!;

    htmlparser.DomUtils.removeElement(el);
  }

  getHtml() {
    return serializer.default(this._doc.children);
  }

  //#endregion

  //#region Css

  parseCss(css: string, media: MediaType) {
    const cssTree = csstree.parse(css);
    this._cssMap.set(media, cssTree);
  }

  addCssRules(celId: string, rules: KeyValuePairModel[], media: MediaType) {
    // const onlyNewRules = this._domCelIds.has(celId)
    //   ? this.syncRules(celId, rules)
    //   : rules;

    let foundIdSelector: csstree.CssNode | undefined = undefined;

    // Media should be, as it refresh for all medias at app start
    const cssTree = this._cssMap.get(media)!;

    csstree.walk(cssTree, {
      visit: 'Rule',
      leave(node, item, list) {
        if (foundIdSelector) return;

        foundIdSelector = csstree.find(
          node,
          (x) => x.type === 'IdSelector' && x.name === celId
        );

        if (!foundIdSelector) return;

        rules.forEach((rule) => {
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

    if (!foundIdSelector && cssTree.type === 'StyleSheet') {
      const addMediaClass =
        media !== MediaType.None
          ? '.' + AppConstants.getMediaCssClass(media) + ' '
          : '';

      const addRootElementClass =
        celId !== AppConstants.HtmlRootSpaceElementId
          ? '#' + AppConstants.HtmlRootSpaceElementId + ' '
          : '';

      const blockNode = cssTree.children.createItem({
        type: 'Rule',
        block: { type: 'Block', children: new csstree.List<csstree.Block>() },
        prelude: {
          type: 'Raw',
          value: `${addMediaClass}${addRootElementClass}#${celId}.${AppConstants.HtmlElementClassName}`,
        },
      }) as csstree.ListItem<csstree.Rule>;

      blockNode.data.block.children.appendData({
        type: 'Raw',
        value: this.rulesToCss(rules),
      });

      cssTree.children.append(blockNode);
    }
  }

  getCss(media: MediaType) {
    const cssTree = this._cssMap.get(media)!;
    return csstree.generate(cssTree);
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
  // private syncRules(celId: string, rules: KeyValuePairModel[]) {
  //   const cel = this._celements.get(celId)!;

  //   const finalRules: KeyValuePairModel[] = [];

  //   rules.forEach((rule) => {
  //     const style = cel.mediaStyles.find((x) => x.name === rule.name);

  //     if (!style) {
  //       finalRules.push(rule);
  //       cel.mediaStyles.push(rule);
  //       return;
  //     }

  //     if (!style.equals(rule)) {
  //       finalRules.push(rule);
  //       style.value = rule.value;
  //       return;
  //     }
  //   });

  //   return finalRules;
  // }

  //#endregion
}
