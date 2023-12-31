import * as path from "path";
import { GitNode } from "./changesGitWidget";

export class NavColorUpdater {
	private navFolderEl?: HTMLElement;
	private repoRelPath?: string;

	constructor(navFolderTitleEl: HTMLElement) {
		this.navFolderEl = navFolderTitleEl.parentElement ?? undefined;
		this.navFolderEl?.addClass("git-widget-container");
		this.repoRelPath =
			navFolderTitleEl.getAttribute("data-path") ?? undefined;
	}

	update(gitNodes: GitNode[]) {
		if (!this.navFolderEl || !this.repoRelPath) return;

		const navItems = this.navFolderEl.querySelectorAll("div[data-path]");

		navItems?.forEach((navItem) => {
			if (this.isNavItemInAnotherRepo(navItem)) return;

			const itemPath = navItem.getAttribute("data-path");

			if (itemPath && this.hasItemChanged(gitNodes, itemPath))
				navItem.addClass("git-changed-file");
			else navItem.removeClass("git-changed-file");
		});
	}

	private isNavItemInAnotherRepo = (navItemEl: Element) =>
		!navItemEl
			?.closest(".git-widget-container")
			?.isEqualNode(this.navFolderEl ?? HTMLElement.prototype);

	private hasItemChanged = (nodes: GitNode[], navPath: string) =>
		nodes.some((node) => {
			const vaultNodeRelPath = path.join(
				this.repoRelPath ?? "",
				node.path
			);
			return !path.relative(navPath, vaultNodeRelPath).startsWith("..");
		});
}
