/**
 * @packageDocumentation
 * @module Pages
 */

import { join } from "path";
import { ChildPageDefinition, PageDefinition, PageGroupDefinition, PageSectionDefinition, PluginOptions } from "../options/models/";
import { getFilename } from "../utilities/path-utilities";
import { ChildPage, Page, PageDictionary, PageGroup, PageSection } from "./models/";
import * as fs from "fs";
import * as path from "path";

// TODO: document this
export class PageDictionaryFactory {	
	private options: PluginOptions;

	public buildDictionary(options: PluginOptions): PageDictionary {
		this.options = options;
		const groups: PageGroup[] = [];

		for (const group of options.groups) {
			groups.push(this._parsePageGroup(group, options.output));
		}

		if (options.autoPopulateChildren && !options.groups.length && options.source) {
			const params = {
				source: `${options.source}`,
				title: options.title,
				output: "",
				pages: []
			};
			const folderWalk = (subpath, children) => {
				const files = fs.readdirSync(subpath);
				files.filter(f => f.endsWith(".md")).forEach(f => {
					const base = f.substr(0, f.length - 3);
					const child = {source: path.join(subpath, f), output: `${base}.html`, children: []};
					children.push(child);
					const childrenPath = path.join(subpath, base);
					if (fs.existsSync(childrenPath) && fs.lstatSync(childrenPath).isDirectory()) {
						folderWalk(childrenPath, child.children);
					}
				});
			};
			folderWalk(options.source, params.pages);
			groups.push(this._parsePageGroup(params, options.output || ""));
		}

		return new PageDictionary(groups);
	}

	private _parsePageGroup(definition: PageGroupDefinition, urlPrefix: string, parent?: PageSection): PageGroup {
		const group = new PageGroup(definition, urlPrefix, parent);
	
		for (const item of definition.pages) {
			this._parsePageOrSection(item, group.url, group);
		}
	
		return group;
	}

	private _parsePageOrSection(definition: PageDefinition|PageSectionDefinition, urlPrefix: string, parent: Page|PageGroup): void {
		const isSection = !!(definition as any).groups;

		if (isSection) {
			this._parseSection(definition as PageSectionDefinition, urlPrefix, parent);
		} else {
			this._parsePage(definition as PageDefinition, parent as PageGroup);
		}
	}

	private _parseSection(definition: PageSectionDefinition, urlPrefix: string, parent: Page|PageGroup): void {
		const section = new PageSection(definition, urlPrefix, parent);

		for (const group of definition.groups) {
			this._parsePageGroup(group, section.url, section);
		}
	}

	private _parsePage(definition: PageDefinition, parent: PageGroup): void {
		const page = new Page(definition, parent);
		if (this.options.autoDetectPageTitle) {
			page.computeTitle();
		}

		// Get directory name for any child pages or sub-sections
		const subDirectory = join(parent.url, getFilename(definition.output, true));
	
		for (const child of definition.children) {
			this._parseChildPageOrSection(child, subDirectory, page);
		}
	}

	private _parseChildPageOrSection(definition: ChildPageDefinition|PageSectionDefinition, urlPrefix: string, parent: Page): void {
		const isSection = !!(definition as any).groups;

		if (isSection) {
			this._parseSection(definition as PageSectionDefinition, urlPrefix, parent);
		} else {
			this._parseChildPage(definition as ChildPageDefinition, urlPrefix, parent);
		}
	}

	private _parseChildPage(definition: ChildPageDefinition, urlPrefix: string, parent: Page): void {
		const page = new ChildPage(definition, urlPrefix, parent);
		if (this.options.autoDetectPageTitle) {
			page.computeTitle();
		}
	}
}
