/**
 * @packageDocumentation
 * @module Models
 */

import { Page } from "./page";

// TODO: Document this
export class HtmlPage extends Page {

	protected computeTitle(): string {
		const content = this.contents.match(/<h1>(.*)<\/h1>/);
		if (content) {
			this._title = content[1];
			this._contents = this.contents.replace(/<h1>(.*)<\/h1>/, '');
			return this._title;
		}
		return super.computeTitle();
	}

	public get template(): string {
		return "html-page.hbs";
	}
}

Page.registerExtension(".html", HtmlPage);