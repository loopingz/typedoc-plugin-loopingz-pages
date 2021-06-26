/**
 * @packageDocumentation
 * @module Models
 */

import { Page } from "./page";

// TODO: Document this
export class MarkdownPage extends Page {

	protected computeTitle(): string {
		const content = this.contents;
		if (content.startsWith("# ")) {
			this._title = content.substr(2, content.indexOf("\n")-2);
			this._contents = content.substr(content.indexOf("\n")+1);
			return this._title;
		}
		return super.computeTitle();
	}

	public get template(): string {
		return "markdown-page.hbs";
	}
}

Page.registerExtension(".md", MarkdownPage);