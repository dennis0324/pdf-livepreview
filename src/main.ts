import {
	App,
	Editor,
	MarkdownView,
	Modal,
	// Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import * as fs from "fs/promises";
import path from "path";
import * as electron from "electron";

import { livePreviewExtension } from "./livePreivew";
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		this.registerEditorExtension(livePreviewExtension(this.app));
		// console.log(this.)
		// This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon(
		// 	"dice",
		// 	"Sample Plugin",
		// 	(evt: MouseEvent) => {
		// 		// Called when the user clicks the icon.
		// 		new Notice("This is a notice!");
		// 	},
		// );
		// // Perform additional things with the ribbon
		// ribbonIconEl.addClass("my-plugin-ribbon-class");
		//
		// // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText("Status Bar Text");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
		this.addCommand({
			id: "example-editor-command",
			name: "Example editor command",
			editorCallback: (editor, view) => {
				// @ts-expect-error, not typed
				const editorView = view.editor.cm as EditorView;

				const plugin = editorView.plugin(
					livePreviewExtension(this.app),
				);

				console.log(plugin);
				// const scale = 1.25;
				if (plugin) {
					new SampleModal(this.app, plugin).open();
					// webview.src = `app://obsidian.md/help.html`;
					// win.loadURL("app://obsidian.md/help.html");
					// win.webContents.on("did-finish-load", () => {
					// 	win.webContents.printToPDF({});
					// });
					// plugin.addPointerToSelection(editorView);
				}
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				// @ts-expect-error, not typed
				const editorView = view.editor.cm as EditorView;

				console.log(editorView);

				// const plugin = editorView.plugin(
				// 	livePreviewExtension(this.app),
				// );
				// console.log("plugin", plugin);

				// if (plugin) {
				// 	plugin.addPointerToSelection(editorView);
				// }
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// this.registerDomEvent(document, "click", (evt: MouseEvent) => {
		// 	console.log("click", evt);
		// });

		// this.registerInterval(
		// 	window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000),
		// );
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	plugin: any = null;
	constructor(app: App, plugin: any) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		// contentEl.setText("Woah!");
		const e = contentEl.createEl("div");
		const wb = document.createElement("webview");
		const scale = 1.25;
		wb.src = "app://obsidian.md/help.html";
		wb.setAttribute(
			"style",
			`height:700px;
			width: calc(${scale} * 100%);
			transform: scale(${1 / scale}, ${1 / scale});
			transform-origin: top left;
			border: 1px solid #f2f2f2;
			`,
		);
		wb.nodeintegration = true;
		wb.addEventListener("dom-ready", () => {
			console.log(decodeURIComponent(this.plugin.dom.outerHTML));
			// this.plugin.dom.children((e: any) => e.removeAttribute("class"));
			wb.executeJavaScript(`
// document.body.innerHTML = decodeURIComponent(\`${encodeURIComponent(this.plugin.dom.outerHTML)}\`);
document.body.innerHTML = "<div><br/></div><div>asdf</div>" 
// document.body.setAttribute("class", \`${document.body.getAttribute("class")}\`)
// document.body.setAttribute("style", \`${document.body.getAttribute("style")}\`)
`);
			wb.insertCSS(`@media print{
				div {
// position:absolute !important;
// left:0 !important;
// top:0 !important;
    visibility: visible !important;
display:unset !important;
				}
			}`);
		});
		console.log(this.plugin.dom);
		e.appendChild(wb);

		const handleExport = async () => {
			const data = await wb.printToPDF({
				// margins: { top: 3, left: 0, right: 0, bottom: 3 },
			});
			fs.writeFile("/Users/donghyunko//Downloads/test.pdf", data);
		};

		new Setting(contentEl).setHeading().addButton((button) => {
			button.setButtonText("Export").onClick(handleExport);
			button.setCta();
			// fullWidthButton(button);
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
