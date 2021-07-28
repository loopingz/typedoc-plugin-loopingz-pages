import { MarkdownEvent, PageEvent } from "typedoc/dist/lib/output/events";
import { PageLinkParser, INVALID_LINKS_HEADER_STRING } from "../../../src/links/page-link-parser";
import { IMock, Mock, It, Times } from "typemoq";
import { PluginOptions } from "../../../src/options/models";
import { PageDictionary, Page, HtmlPage } from "../../../src/pages/models";
import { Logger } from "typedoc/dist/lib/utils";

interface TestCase {
	title: string;
	input: string;
	output: string;
	invalidLinks?: string[];
}

const testCases: TestCase[] = [
	{
		title: "No page links",
		input: "This is sample text.",
		output: "This is sample text.",
	},
	{
		title: "Basic @page tag",
		input: "See {@page Something} for more information.",
		output: `See <a href="/something/url.html">Something</a> for more information.`,
	},
	{
		title: "Basic @pagelink tag",
		input: "See {@pagelink Something} for more information.",
		output: `See <a href="/something/url.html">Something</a> for more information.`,
	},
	{
		title: "Multiple @page tags",
		input: "See {@page Something} for more information about {@page Feature}.",
		output: `See <a href="/something/url.html">Something</a> for more information about <a href="/feature/url.html">Feature</a>.`,
	},
	{
		title: "Space in page title",
		input: "See {@pagelink Something Here} for more information.",
		output: `See <a href="/something/here/url.html">Something Here</a> for more information.`,
	},
	{
		title: "Custom link text (no spaces)",
		input: "See {@page Something Here|custom text} for more information.",
		output: `See <a href="/something/here/url.html">custom text</a> for more information.`,
	},
	{
		title: "Custom link text (leading and trailing spaces)",
		input: "See {@page Something Here | custom text} for more information.",
		output: `See <a href="/something/here/url.html">custom text</a> for more information.`,
	},
	{
		title: "Custom link text (leading space)",
		input: "See {@page Something Here |custom text} for more information.",
		output: `See <a href="/something/here/url.html">custom text</a> for more information.`,
	},
	{
		title: "Custom link text (trailing space)",
		input: "See {@page Something Here| custom text} for more information.",
		output: `See <a href="/something/here/url.html">custom text</a> for more information.`,
	},
	{
		title: "Sanitizes newlines",
		input: "See {@page \nSomething\nHere|\ncustom text\n} for more information.",
		output: `See <a href="/something/here/url.html">custom text</a> for more information.`,
	},
	{
		title: "Invalid page title",
		input: "See {@page Does Not Exist} for more information.",
		output: `See {@page Does Not Exist} for more information.`,
		invalidLinks: ["{@page Does Not Exist}"],
	},
	{
		title: "Valid and invalid tags",
		input: "See {@page Something} for more information about {@page Does Not Exist}.",
		output: `See <a href="/something/url.html">Something</a> for more information about {@page Does Not Exist}.`,
		invalidLinks: ["{@page Does Not Exist}"],
	},
	{
		title: "Group @page tag",
		input: "See {@page Group Title} for more information.",
		output: `See <a href="url.html">Group Title</a> for more information.`,
	},
	{
		title: "Empty group @page tag",
		input: "See {@page Empty Group} for more information.",
		output: `See {@page Empty Group} for more information.`,
		invalidLinks: ["{@page Empty Group}"],
	},
];

describe("PageLinkParser", () => {
	const currentPageTitle = "Current Page Title";
	const currentPageUrl = "./current/page/url.md";

	let optionsMock: IMock<PluginOptions>;
	let pageDictionaryMock: IMock<PageDictionary>;
	let loggerMock: IMock<Logger>;

	let sut: PageLinkParser;

	function addPageToDictionary(title: string, url: string): void {
		const pageMock = Mock.ofType<Page>();
		pageMock.setup(m => m.title).returns(() => title);
		pageMock.setup(m => m.url).returns(() => url);
		pageDictionaryMock.setup(m => m.getByTitle(title)).returns(() => pageMock.object);
	}

	function addGroupToDictionary(title: string, firstPageUrl?: string): void {

		const page = new HtmlPage("source");
		pageDictionaryMock.setup(m => m.getByTitle(title)).returns(() => page);
	}

	beforeEach(() => {
		optionsMock = Mock.ofType<PluginOptions>();
		pageDictionaryMock = Mock.ofType<PageDictionary>();
		loggerMock = Mock.ofType<Logger>();

		addPageToDictionary("Something", "/something/url.html");
		addPageToDictionary("Something Here", "/something/here/url.html");
		addPageToDictionary("Feature", "/feature/url.html");
		addGroupToDictionary("Group Title", "url.html");
		addGroupToDictionary("Empty Group");

		sut = new PageLinkParser(optionsMock.object, pageDictionaryMock.object, loggerMock.object);
		(sut as any)._getRelativeUrl = (absoluteUrl: string): string => absoluteUrl;
	});

	function enableFeatures(parsing: boolean, invalidLinkLogging: boolean, failOnInvalidLink: boolean): void {
		optionsMock.reset();
		optionsMock.setup(m => m.enablePageLinks).returns(() => parsing);
		optionsMock.setup(m => m.listInvalidPageLinks).returns(() => invalidLinkLogging);
		optionsMock.setup(m => m.failBuildOnInvalidPageLink).returns(() => failOnInvalidLink);
	}

	function prepareTestCase(testCase: TestCase): MarkdownEvent {
		// Prepare page event and pass to sut
		const pageEventMock = Mock.ofType<PageEvent>();
		pageEventMock.setup(m => m.model).returns(() => {
			return {
				name: currentPageTitle,
			};
		});
		pageEventMock.setup(m => m.url).returns(() => currentPageUrl);
		sut.setCurrentPage(pageEventMock.object);

		// Prepare markdown event mock
		const markdownEvent = new MarkdownEvent("", "", testCase.input);

		return markdownEvent;
	}

	describe("parsePageLinks()", () => {
		describe("correctly replaces page links when feature is enabled", () => {
			for (const testCase of testCases) {
				test(testCase.title, () => {
					// arrange
					enableFeatures(true, false, false);
					const event = prepareTestCase(testCase);
	
					// act
					sut.parsePageLinks(event);
	
					// assert
					expect(event.parsedText).toEqual(testCase.output);
				});
			}
		});

		describe("does not replace page links when parsing is disabled", () => {
			for (const testCase of testCases) {
				test(testCase.title, () => {
					// arrange
					enableFeatures(false, false, false);
					const event = prepareTestCase(testCase);
	
					// act
					sut.parsePageLinks(event);
	
					// assert
					expect(event.parsedText).toEqual(testCase.input);
				});
			}
		});

		describe("throws an error if invalid links encountered and are configured to fail the build", () => {
			for (const testCase of testCases) {
				test(testCase.title, () => {
					// arrange
					enableFeatures(true, false, true);
					const event = prepareTestCase(testCase);
	
					// act
					let error: Error;
					try {
						sut.parsePageLinks(event);
					} catch (e) {
						error = e;
					}
	
					// assert
					if (testCase.invalidLinks && testCase.invalidLinks.length > 0) {
						expect(error).toBeDefined();
						expect(event.parsedText).toEqual(testCase.input);
					} else {
						expect(error).toBeUndefined();
						expect(event.parsedText).toEqual(testCase.output);
					}
				});
			}
		});

		describe("does not throw an error for invalid links when parsing is disabled", () => {
			for (const testCase of testCases) {
				test(testCase.title, () => {
					// arrange
					enableFeatures(false, false, true);
					const event = prepareTestCase(testCase);
	
					// act
					sut.parsePageLinks(event);
	
					// assert
					expect(event.parsedText).toEqual(testCase.input);
				});
			}
		});
	});

	describe("listInvalidPageLinks()", () => {
		test("writes list of invalid links to console when feature is enabled and invalid links were encountered", () => {
			// arrange
			enableFeatures(true, true, false);
			let expectedLog = INVALID_LINKS_HEADER_STRING;
			for (const testCase of testCases) {
				if (testCase.invalidLinks) {
					for (const link of testCase.invalidLinks) {
						expectedLog += `\n  In ${currentPageTitle}: ${link}`;
					}
				}
				const event = prepareTestCase(testCase);
				sut.parsePageLinks(event);
			}

			// act
			sut.listInvalidPageLinks();

			// assert
			loggerMock.verify(m => m.warn(expectedLog), Times.once());
		});

		test("does not write list of invalid links to console when feature is disabled and invalid links were encountered", () => {
			// arrange
			enableFeatures(true, false, false);
			for (const testCase of testCases) {
				const event = prepareTestCase(testCase);
				sut.parsePageLinks(event);
			}

			// act
			sut.listInvalidPageLinks();

			// assert
			loggerMock.verify(m => m.warn(It.isAnyString()), Times.never());
		});

		test("does not write list of invalid links to console when no invalid links were encountered", () => {
			// arrange
			enableFeatures(true, true, false);
			
			// act
			sut.listInvalidPageLinks();

			// assert
			loggerMock.verify(m => m.warn(It.isAnyString()), Times.never());
		});
	});
});
