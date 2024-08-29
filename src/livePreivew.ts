import { App } from "obsidian";

import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";
import {
	Decoration,
	DecorationSet,
	EditorView,
	PluginSpec,
	PluginValue,
	ViewPlugin,
	ViewUpdate,
	// WidgetType,
} from "@codemirror/view";
import { EmojiWidget } from "emoji";

class EmojiListPlugin implements PluginValue {
	decorations: DecorationSet;
	dom: HTMLElement;

	constructor(view: EditorView) {
		this.decorations = this.buildDecorations(view);
	}

	update(update: ViewUpdate) {
		if (update.docChanged || update.viewportChanged) {
			this.decorations = this.buildDecorations(update.view);
		}
	}

	destroy() {}

	buildDecorations(view: EditorView): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();
		console.log("view", view);
		// view.docView.dom.style.width = "794px";
		// docview.chilldren으로 만들면 될 듯 전체 넓이 구해서 pdf lib랑 같이 하면 됨
		// electron에서 pdf 출력하고 해당 pdf를 수정하는 형식으로 진행
		this.dom = view.contentDOM;
		// console.log(view.contentDOM);
		for (const { from, to } of view.visibleRanges) {
			syntaxTree(view.state).iterate({
				from,
				to,
				enter(node) {
					// console.log(node);
					if (node.type.name.startsWith("list")) {
						// Position of the '-' or the '*'.
						const listCharFrom = node.from - 2;

						builder.add(
							listCharFrom,
							listCharFrom + 1,
							Decoration.replace({
								widget: new EmojiWidget(),
							}),
						);
					}
				},
			});
		}

		return builder.finish();
	}

	getDom() {
		return this.dom;
	}
}

const pluginSpec: PluginSpec<EmojiListPlugin> = {
	decorations: (value: EmojiListPlugin) => value.decorations,
};
const emojiListPlugin = ViewPlugin.fromClass(EmojiListPlugin, pluginSpec);
export const livePreviewExtension = (app: App) => emojiListPlugin;
