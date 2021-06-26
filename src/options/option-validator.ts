/**
 * @packageDocumentation
 * @module Options
 */

import { PluginOptions } from "./models/";
import { defaultOptionAndValidateIsBoolean, defaultOptionAndValidateIsString } from "./validation-utilities";
import * as Constants from "../constants";

/**
 * Helper class for validating plugin options
 */
export class OptionValidator {
	public validate(options: PluginOptions): void {
		defaultOptionAndValidateIsBoolean(options, "enablePageLinks", Constants.DEFAULT_ENABLE_PAGE_LINKS);
		defaultOptionAndValidateIsBoolean(options, "enableSearch", Constants.DEFAULT_ENABLE_SEARCH);
		defaultOptionAndValidateIsBoolean(options, "failBuildOnInvalidPageLink", Constants.DEFAULT_FAIL_BUILD_ON_INVALID_PAGE_LINK);
		defaultOptionAndValidateIsBoolean(options, "listInvalidPageLinks", Constants.DEFAULT_LIST_INVALID_PAGE_LINKS);
		defaultOptionAndValidateIsString(options, "output", Constants.DEFAULT_OUTPUT);
		defaultOptionAndValidateIsString(options, "reflectionNavigationTitle", Constants.DEFAULT_REFLECTION_NAV_TITLE);
		defaultOptionAndValidateIsBoolean(options, "replaceGlobalsPage", Constants.DEFAULT_REPLACE_GLOBALS_PAGE);
		defaultOptionAndValidateIsString(options, "source", ".");
		// TODO Validate sources
	}
}
