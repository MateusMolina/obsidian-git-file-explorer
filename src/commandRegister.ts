import { Plugin } from "obsidian";
import { CapabilityProvider } from "./capabilityProvider";

export class CommandRegister {
    constructor(private plugin: Plugin) {}

    public registerCommandForActiveFile(provider: CapabilityProvider): void {
        this.plugin.addCommand({
            id: provider.getCommandId(),
            name: provider.getCommandName(),
            icon: provider.getIcon(),
            checkCallback: (checking: boolean) => {
                const file = this.plugin.app.workspace.getActiveFile();
                if (file) {
                    if (!checking) {
                        provider.execute(file);
                    }
                    return true;
                }
                return false;
            }
        });
    }
}