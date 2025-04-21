import * as os from "os";
import { join } from "path";
import { exec, spawnSync } from "child_process";
import { writeFileSync, unlinkSync } from "fs";

/**
 * Utility class for handling terminal operations across different platforms
 * 
 * #todo search for a library that can handle this 
 */
export class TerminalExecutor {
    /**
     * Executes a command in the appropriate terminal for the current operating system
     * @param workingDir The working directory where the command should be executed
     * @param command The command to execute in the terminal
     * @returns A promise that resolves when the command has been launched
     */
    static async execute(workingDir: string, command: string): Promise<void> {
        const platform = os.platform();

        if (platform === 'win32') {
            return TerminalExecutor.executeInWindowsTerminal(workingDir, command);
        } else if (platform === 'darwin') {
            return TerminalExecutor.executeInMacOSTerminal(workingDir, command);
        } else {
            return TerminalExecutor.executeInLinuxTerminal(workingDir, command);
        }
    }

    private static executeInWindowsTerminal(workingDir: string, command: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const fullCommand = `start "" /B cmd /C "cd /d "${workingDir}" && ${command}"`;
            exec(fullCommand, (error) => {
                if (error) {
                    console.error('Failed to execute command in Windows terminal:', error);
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    private static executeInMacOSTerminal(workingDir: string, command: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // Execute the command via AppleScript
            const appleCmd = `tell application "Terminal" to do script "cd '${workingDir}' && ${command}"`;
            exec(`osascript -e '${appleCmd}'`, (error) => {
                if (error) {
                    console.error('Failed to execute command in macOS terminal:', error);
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    private static executeInLinuxTerminal(workingDir: string, command: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Create a temporary shell script to ensure the terminal stays open
                const tmpScriptPath = join(os.tmpdir(), `terminal-cmd-${Date.now()}.sh`);
                const scriptContent = `#!/bin/bash
cd "${workingDir}" && ${command}
echo "Press Enter to close"
read
`;
                writeFileSync(tmpScriptPath, scriptContent, { mode: 0o755 });
                
                // Try to find an available terminal emulator
                const terminals = [
                    { cmd: "gnome-terminal", args: `-- bash "${tmpScriptPath}"` },
                    { cmd: "xterm", args: `-e "${tmpScriptPath}"` },
                    { cmd: "konsole", args: `--noclose -e bash "${tmpScriptPath}"` },
                    { cmd: "xfce4-terminal", args: `--hold -e "${tmpScriptPath}"` },
                    { cmd: "terminator", args: `-e "${tmpScriptPath}"` },
                    { cmd: "tilix", args: `-e "${tmpScriptPath}"` },
                ];
                
                let found = false;
                for (const term of terminals) {
                    try {
                        // Check if the terminal is available using which command
                        const result = spawnSync('which', [term.cmd]);
                        if (result.status === 0) {
                            const terminalCmd = `${term.cmd} ${term.args}`;
                            exec(terminalCmd, (error) => {
                                // Cleanup temp script (but don't block on it)
                                try { unlinkSync(tmpScriptPath); } catch {}
                                
                                if (error) {
                                    console.error('Failed to execute command in Linux terminal:', error);
                                    reject(error);
                                } else {
                                    resolve();
                                }
                            });
                            found = true;
                            break;
                        }
                    } catch {
                        // Terminal not found, try next one
                    }
                }
                
                // If no terminals were found, fall back to running the command directly
                if (!found) {
                    console.warn('No terminal emulator found, running command directly');
                    exec(`cd "${workingDir}" && ${command}`, (error) => {
                        if (error) {
                            console.error('Failed to execute command:', error);
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                }
            } catch (error) {
                console.error('Error setting up Linux terminal:', error);
                reject(error);
            }
        });
    }
}