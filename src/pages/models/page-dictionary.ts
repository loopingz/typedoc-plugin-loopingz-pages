/**
 * @packageDocumentation
 * @module Pages
 */

import { Page } from "./page";

// TODO: document this
export class PageDictionary {
	private _pages: Set<Page>;
	private _sources: string[] = [];

	constructor() {
		this._pages = new Set<Page>();
	}

	public get all(): Set<Page> {
		return this._pages;
	}


	addPage(page: Page): void {
		if (this._sources.indexOf(page.source) >= 0) {
			return;
		}
		this._pages.add(page);
		this._sources.push(page.source);
	}

	public getByTitle(title: string): Page {
		return ([...this._pages].filter((p: Page) => p.title === title).pop());
	}
}
