import { Menu, MenuItem, Plugin, TFile, TFolder } from "obsidian";
import { CapabilityProvider } from "./capabilityProvider";

export class ContextMenuInstaller {
    constructor(private plugin: Plugin) {}

    public installContextMenu(provider: CapabilityProvider): void {
        this.plugin.registerEvent(
            this.plugin.app.workspace.on("file-menu", (menu: Menu, fileOrFolder: TFile | TFolder) => {
                menu.addItem((item: MenuItem) => {
                    item.setTitle(provider.getCommandName())
                        .setIcon(provider.getIcon())
                        .onClick(() => provider.execute(fileOrFolder));
                });
            })
        );
    }
}