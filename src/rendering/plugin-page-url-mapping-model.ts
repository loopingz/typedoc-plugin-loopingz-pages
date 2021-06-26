/**
 * @packageDocumentation
 * @module Rendering
 */


import { Page } from "../pages/models/";

// TODO: Document this
export enum ModelItemType {
	Page = "page"
}

export interface UrlMappingModelPluginMetadata {
	isPluginItem: boolean;
	item?: Page;
	options: {
		replaceGlobalsPage: boolean;
	};
	type?: ModelItemType;
}

// TODO: Document this
export interface PluginPageUrlMappingModel {
	[key: string]: any;
	pagesPlugin: UrlMappingModelPluginMetadata;
}
