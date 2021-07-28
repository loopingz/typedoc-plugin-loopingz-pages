/**
 * @packageDocumentation
 * @module Pages
 */

import { join } from "path";
import { PluginOptions } from "../options/models/";
import { Page, PageDictionary } from "./models/";
import * as fs from "fs";
import { basename, dirname } from "path";

// TODO: document this
export class PageDictionaryFactory {	
	private options: PluginOptions;
	private dictionary: PageDictionary;

	protected walk(folderPath: string, parent?: Page): void {

		if (fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory()) {
			fs.readdirSync(folderPath).forEach(f => {
				this.addPage(join(folderPath, f), parent);
			});
		}
	}

	protected addPage(path: string, parent?: Page): Page {
		console.log('walk', path, parent?true:false);
		const page = Page.getPageFromFile(path, parent);
		if (!page) {
			console.log('not managed', path);
			return;
		}
		let folderPath = path;
		if (basename(path).indexOf(".") >= 0) {
			const filename = basename(path);
			folderPath = join(dirname(path), filename.substr(0, filename.lastIndexOf(".")));
		}

		this.walk(folderPath, page);
		
		this.dictionary.addPage(page);
		return page;
	}

	public buildDictionary(options: PluginOptions): PageDictionary {
		if (this.dictionary) {
			return this.dictionary;
		}
		this.options = options;
		this.dictionary = new PageDictionary();

		options.sources = options.sources || [];
		if (options.source) {
			options.sources.push(options.source);
		}
		if (!options.sources.length) {
			throw new Error("Need to define at least one of source|sources");
		}
		
		options.sources.forEach(f => {
			if (fs.lstatSync(f).isDirectory()) {
				this.walk(f);
			} else {
				this.addPage(f);
			}
		});
		//const pages = [...this.dictionary.all];
		//console.log(pages.map(p => ({'title':p.title, 'src':p.source, 'parent': p.parent?true:false})));
		return this.dictionary;
	}
}
