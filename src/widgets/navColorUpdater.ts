import * as path from "path";
import { GitNode } from "./changesGitWidget";

export class NavColorUpdater {
    private navFolderEl?: HTMLElement;
    private repoRelPath?: string;
    private styleEl: HTMLStyleElement;

    constructor(navFolderTitleEl: HTMLElement) {
        this.navFolderEl = navFolderTitleEl.parentElement ?? undefined;
        this.navFolderEl?.addClass("git-widget-container");
        this.repoRelPath = navFolderTitleEl.getAttribute("data-path") ?? undefined;
        
        this.styleEl = document.createElement('style');
        document.head.appendChild(this.styleEl);
    }

    update(gitNodes: GitNode[]) {
        if (!this.repoRelPath) return;

        const changedPaths = gitNodes.map((node) => {
            const rel = node.path.replace(/\\/g, "/");
            return path.posix.normalize(`${this.repoRelPath}/${rel}`);
        });
        
        const cssRules: string[] = [];
        
        changedPaths.forEach(changedPath => {
            const escapedPath = CSS.escape(changedPath);
            
            cssRules.push(`
                .nav-file-title[data-path="${escapedPath}"] {
					color: #b38522 !important;
                }
            `);
            
            let parentPath = path.dirname(changedPath);
            while (parentPath && parentPath !== "." && parentPath !== "/") {
                const escapedParentPath = CSS.escape(parentPath);
                cssRules.push(`
                    .nav-folder-title[data-path="${escapedParentPath}"] {
    					color: #b38522 !important;
                    }
                `);
                parentPath = path.dirname(parentPath);
            }
        });
        
        // Apply all CSS rules at once
        this.styleEl.textContent = cssRules.join('\n');
    }
    
    cleanup() {
        if (this.styleEl && this.styleEl.parentNode) {
            this.styleEl.parentNode.removeChild(this.styleEl);
        }
    }
}
