import "obsidian";
declare module "obsidian" {
	export class FileExplorer extends View {
		fileItems: { [key: string]: AFItem };
		files: WeakMap<HTMLDivElement, TAbstractFile>;
		getViewType(): string;
		getDisplayText(): string;
		onClose(): Promise<void>;
	}

	export type AFItem = FolderItem | FileItem;

	export interface FileItem {
		el: HTMLDivElement;
		file: TFile;
		fileExplorer: FileExplorer;
		info: any;
		selfEl: HTMLDivElement;
		innerEl: HTMLDivElement;
	}

	export interface FolderItem {
		el: HTMLDivElement;
		fileExplorer: FileExplorer;
		info: any;
		selfEl: HTMLDivElement;
		innerEl: HTMLDivElement;
		file: TFolder;
		children: AFItem[];
		childrenEl: HTMLDivElement;
		collapseIndicatorEl: HTMLDivElement;
		collapsed: boolean;
		pusherEl: HTMLDivElement;
	}
}
