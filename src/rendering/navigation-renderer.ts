/**
 * @packageDocumentation
 * @module Rendering
 */

import { PageEvent } from "typedoc/dist/lib/output/events";
import { PluginOptions } from "../options/models/";
import { Page, PageDictionary } from "../pages/models/";
import { NavigationItemFactory } from "./navigation-item-factory";
import { PluginPageUrlMappingModel } from "./plugin-page-url-mapping-model";
import { PluginNavigationItem } from "./plugin-navigation-item";

/**
 * Handles the rendering of items in the navigation sidebar
 */
export class NavigationRenderer {
	private _itemFactory: NavigationItemFactory;
	private _hasAddedStandardNavigationTitle: boolean;
	private _options: PluginOptions;
	private _pages: PageDictionary;

	/**
	 * Creates an instance of NavigationRenderer
	 * @param options Plugin options
	 * @param pages Page dictionary
	 * @param itemFactory Navigation item factory
	 */
	constructor(options: PluginOptions, pages: PageDictionary, itemFactory: NavigationItemFactory) {
		this._options = options;
		this._pages = pages;
		this._itemFactory = itemFactory;
		this._hasAddedStandardNavigationTitle = false;
	}

	/**
	 * Ensures that there are navigation items for plugin pages in the sidebar
	 *
	 * @param event TypeDoc Page evnet
	 */
	public addPluginNavigation(event: PageEvent): void {
		// Determine if the page being rendered is a plugin item
		const isPluginItem = (event.model as PluginPageUrlMappingModel).pagesPlugin.isPluginItem;

		this._ensureStandardNavigationHasTitle(event);
		this._ensureStandardNavigationVisible(event, isPluginItem);
		this._removeGlobalsNavigationItem(event);

		const pluginNavigationItems = this._getPluginNavigationItems(event, isPluginItem);

		// Clear out all previously added plugin items
		const nonPluginItems = event.navigation.children.filter((item: PluginNavigationItem) => {
			return !item.isPluginItem || item.isReflectionNavigationTitle;
		});

		// Add provided items to beginning of navigation
		event.navigation.children = [
			...pluginNavigationItems,
			...nonPluginItems,
		];
	}

	//#region NavigationItem Construction Helpers

	private _getPluginNavigationItems(event: PageEvent, isPluginItem: boolean): PluginNavigationItem[] {
		const pages = [...this._pages.all];
		return this._buildNavigationForPageGroups(event, pages.filter(p => !p.parent));
	}

	private _buildNavigationForPageGroups(event: PageEvent, pages: Page[]): PluginNavigationItem[] {
		let items: PluginNavigationItem[] = [];
	
		for (const page of pages) {
			items = [
				...items,
				...this._itemFactory.buildPageItems(page, event.model, event.url),
			];
		}
	
		return items;
	}

	//#endregion

	//#region Reflection Navigation Helpers

	private _ensureStandardNavigationHasTitle(event: PageEvent): void {
		if (!this._hasAddedStandardNavigationTitle && this._options.reflectionNavigationTitle) {
			event.navigation.children.unshift(this._itemFactory.buildLabelItem(this._options.reflectionNavigationTitle, true));
			this._hasAddedStandardNavigationTitle = true;
		}
	}

	private _ensureStandardNavigationVisible(event: PageEvent, isPluginItem: boolean): void {
		if (isPluginItem) {
			for (const item of event.navigation.children) {
				item.isVisible = true;
			}
		}
	}

	private _removeGlobalsNavigationItem(event: PageEvent): void {
		if (this._options.replaceGlobalsPage) {
			for (let i = 0; i < event.navigation.children.length; i++) {
				if (event.navigation.children[i].isGlobals) {
					event.navigation.children.splice(i, 1);
				}
			}
		}
	}

	//#endregion
}
