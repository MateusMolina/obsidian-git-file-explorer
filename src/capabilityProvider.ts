import { TFile, TFolder } from "obsidian";

export interface CapabilityProvider {
    execute(fileOrFolder: TFile | TFolder): Promise<void>;
    
    // UI/UX related
    getCommandName(): string;
    getIcon(): string;
    getCommandId(): string;
}