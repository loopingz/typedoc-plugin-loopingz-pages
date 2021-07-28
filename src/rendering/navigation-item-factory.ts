/**
 * @packageDocumentation
 * @module Rendering
 */

import { NavigationItem } from "typedoc";
import { Page } from "../pages/models/";
import { PluginPageUrlMappingModel } from "./plugin-page-url-mapping-model";
import { PluginNavigationItem } from "./plugin-navigation-item";

/**
 * Factory class for creating TypeDoc navigation items
 */
// TODO: Document this
export class NavigationItemFactory {
	/**
	 * Creates a TypeDoc navigation item that serves as a navigation sidebar title
	 *
	 * @param label Label text
	 * @returns The created navigation item
	 */
	public buildLabelItem(label: string, isReflectionNavigationTitle: boolean): PluginNavigationItem {
		const item = new NavigationItem(label) as PluginNavigationItem;
		item.isPluginItem = true;
		item.isReflectionNavigationTitle = isReflectionNavigationTitle;
		item.isLabel = true;
		item.isVisible = true;
		item.cssClasses = "pp-nav pp-group";
		return item;
	}

	/**
	 * Creates the TypeDoc navigation items for a page
	 *
	 * @param navigationItemPage Page to render the navigation item for
	 * @param pageRenderModel Model for the current page render
	 * @param urlBeingRendered The URL of the current page render
	 * @returns The created navigation items
	 */
	public buildPageItems(navigationItemPage: Page, pageRenderModel: PluginPageUrlMappingModel, urlBeingRendered: string): PluginNavigationItem[] {
		let items: PluginNavigationItem[] = [];

		const childIsActivePage = pageRenderModel.pagesPlugin && pageRenderModel.pagesPlugin.item && pageRenderModel.pagesPlugin.item.parent === navigationItemPage;

		items.push(this.buildItem(navigationItemPage, navigationItemPage.url === urlBeingRendered, childIsActivePage));

		let found = false;
		let parent = pageRenderModel.pagesPlugin.item;
		const parents = [];
		while (parent) {
			if (parent === navigationItemPage) {
				found = true;
				break;
			}
			parents.push(parent);
			parent = parent.parent;
		}
		if (found) {
			for (const child of parent.children) {
				items = [
					...items,
					...this.buildChildPageItems(child, urlBeingRendered, parents),
				];
			}
		}
		return items;
	}

	/**
	 * Creates the TypeDoc navigation items for a child page
	 *
	 * @param navigationItemPage Page to render the navigation item for
	 * @param urlBeingRendered The URL of the current page render
	 * @returns The created navigation items
	 */
	public buildChildPageItems(navigationItemPage: Page, urlBeingRendered: string, pages: Page[]): PluginNavigationItem[] {
		const items: PluginNavigationItem[] = [];

		items.push(this.buildItem(navigationItemPage, navigationItemPage.url === urlBeingRendered, false));
		if (pages.indexOf(navigationItemPage) >= 0) {
			for (const child of navigationItemPage.children) {	
				if (pages.indexOf(child) >= 0) {
					items.push(...this.buildChildPageItems(child, urlBeingRendered, pages));
				} else {
					items.push(this.buildItem(child, child.url === urlBeingRendered, false));
				}
			}
		}

		return items;
	}

	/**
	 * Creates a TypeDoc navigation item
	 *
	 * @param label Item text
	 * @param url Item URL
	 * @param isActive Whether the item is active
	 * @param isChild Whether the item is a child page
	 * @param isParent Whether the item is a parent
	 * @param isParentOfActive Whether the item is a parent of the active page
	 * @returns The created navigation item
	 */
	public buildItem(model: Page, isActive: boolean, isParentOfActive: boolean): PluginNavigationItem {
		const item = new NavigationItem(model.title, model.url) as PluginNavigationItem;
		let deep = 0;
		let parent = model.parent;
		while (parent) {
			deep++;
			parent = parent.parent;
		}
		item.isPluginItem = true;
		item.isLabel = false;
		item.isVisible = true;
		item.isInPath = isActive;

		let cssClasses = `pp-nav pp-page pp-depth-${deep}`;
		if (isParentOfActive) {
			cssClasses += " pp-active";
		}
		item.cssClasses = cssClasses;

		return item;
	}

	public buildBackButton(label: string, url: string): PluginNavigationItem {
		const item = new NavigationItem(label, url) as PluginNavigationItem;

		item.isPluginItem = true;
		item.isLabel = false;
		item.isVisible = true;
		item.isInPath = false;
		item.cssClasses = "pp-nav pp-back-btn";

		return item;
	}
}