/**
 * @packageDocumentation
 * @module Models
 */

import { readFileSync } from "fs";
import { basename, join } from "path";

// TODO: Document this
export abstract class Page {
	static registry: {ext: string, func: new (src: string, parent?: Page) => Page}[] = []; // eslint-disable-line

	protected _title: string;
	protected _url: string;
	protected _childrenUrl: string;
	private _children: Array<Page>;
	private _parent: Page;

	protected _contents: string|undefined;
	private _source: string;

	constructor(source: string, parent?: Page) {
		this._source = source;
		this._contents = readFileSync(this.source, "utf8");
		this._children = [];
		this._parent = parent;
		let filename = basename(source);
		if (filename.indexOf(".") > 0) {
			filename = filename.substr(0, filename.lastIndexOf("."));
		}
		if (parent) {
			this._childrenUrl = join(parent.childrenUrl, filename);
			this._url = join(parent.childrenUrl, filename + ".html");
			parent.children.push(this);
		} else {
			this._childrenUrl = join('pages', filename);
			this._url = join('pages', filename + ".html");
		}
	}

	protected computeTitle(): string {
		return basename(this.source);
	}

	public get children(): Array<Page> {
		return this._children;
	}

	public get parent(): Page {
		return this._parent;
	}

	public get title(): string {
		if (!this._title) {
			this._title = this.computeTitle();
		}
		return this._title;
	}

	public get url(): string {
		return this._url;
	}

	public get childrenUrl(): string {
		return this._childrenUrl;
	}

	public abstract get template(): string;

	public get contents(): string {
		try {
			if (!this._contents) {
				this._contents = readFileSync(this.source, "utf8");
			}
			return this._contents;
		} catch (e) {
			throw new Error(`Failed to get page contents. ${e}`);
		}
	}


	public get source(): string {
		return this._source;
	}

	static getPageFromFile(path: string, parent?: Page): Page {
		const info = Page.registry.filter(p => path.endsWith(p.ext)).pop();
		if (info) {
			return new info.func(path, parent);
		}
	}

	static registerExtension(ext: string, func: new (src: string, parent?: Page) => Page): void {
		Page.registry.push({ext, func});
	}
}
