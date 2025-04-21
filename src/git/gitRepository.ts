import simpleGit, { FileStatusResult, SimpleGit } from "simple-git";
import { join } from "path";
import { existsSync } from "fs";
import { exec } from "child_process";
import * as os from "os";

export class GitRepository {
	private git: SimpleGit;
	private remoteBranch: string | undefined = undefined;

	private constructor(public repoAbsPath: string) {
		this.git = simpleGit(this.repoAbsPath);
	}

	async setup() {
		if (await this.hasRemote())
			this.remoteBranch = await this.getRemoteBranch();
	}

	static async getInstance(repoAbsPath: string): Promise<GitRepository> {
		if (!GitRepository.isGitRepo(repoAbsPath)) {
			throw new Error("Not a git repository @ " + repoAbsPath);
		}

		const gitRepository = new GitRepository(repoAbsPath);
		await gitRepository.setup();

		return gitRepository;
	}

	static initGitRepo(repoAbsPath: string): GitRepository {
		const git = simpleGit(repoAbsPath);
		git.init();
		return new GitRepository(repoAbsPath);
	}

	static isGitRepo(fullPath: string): boolean {
		const gitDir = join(fullPath, ".git");
		return existsSync(gitDir);
	}

	async getChangedFiles(): Promise<FileStatusResult[]> {
		const status = await this.git.status();
		return status.files;
	}

	async getToPullCommitsCount(): Promise<number> {
		if (!this.remoteBranch) return Promise.reject("No remote branch");

		await this.git.fetch();
		const count = await this.git.raw([
			"rev-list",
			"--count",
			"HEAD..origin/" + this.remoteBranch,
		]);
		return parseInt(count, 10);
	}

	async getToPushCommitsCount(): Promise<number> {
		if (!this.remoteBranch) return Promise.reject("No remote branch");

		const count = await this.git.raw([
			"rev-list",
			"--count",
			"origin/" + this.remoteBranch + "..HEAD",
		]);
		return parseInt(count, 10);
	}

	async stageAll(): Promise<void> {
		await this.git.add("./*");
	}

	async commit(message: string): Promise<void> {
		await this.git.commit(message);
	}

	async fetchOrigin(): Promise<void> {
		await this.git.fetch();
	}

	async hasRemote(): Promise<boolean> {
		const remotes = await this.git.getRemotes();
		return remotes.length > 0;
	}

	async getRemoteBranch(): Promise<string> {
		const branchName = await this.git.revparse(["--abbrev-ref", "HEAD"]);
		return branchName;
	}

	async pushToOrigin(): Promise<void> {
		if (!this.remoteBranch) return Promise.reject("No remote branch");

		await this.git.push("origin", this.remoteBranch);
	}

	async pullToOrigin(): Promise<void> {
		if (!this.remoteBranch) return Promise.reject("No remote branch");

		await this.git.pull("origin", this.remoteBranch, [
			"--no-edit",
			"--no-rebase",
		]);
	}

	async sync(): Promise<void> {
		await this.pullToOrigin();
		await this.pushToOrigin();
	}

	async backup(commitMsg = ""): Promise<void> {
		if (!commitMsg) commitMsg = "Backup @ " + new Date().toISOString();
		await this.stageAll();
		await this.commit(commitMsg);
	}

	/**
	 * Opens the git diff tool for the specified path
	 * @param repoAbsPath Absolute path to the git repository
	 * @param relativePath The path relative to the repository root
	 * @returns A promise that resolves when the diff tool has been launched
	 */
	static async openDiff(repoAbsPath: string, relativePath: string = ""): Promise<void> {
		if (!GitRepository.isGitRepo(repoAbsPath)) {
			throw new Error("Not a git repository @ " + repoAbsPath);
		}

		return new Promise((resolve, reject) => {
			try {
				// Build the git diff command based on platform
				const platform = os.platform();
				let command;
				
				// Create command based on platform
				if (platform === 'win32') {
					// For Windows, use the start command to launch the external program
					const gitCmd = relativePath 
						? `git difftool --no-prompt -- "${relativePath}"`
						: 'git difftool --no-prompt';
					command = `start "" /B cmd /C "cd /d "${repoAbsPath}" && ${gitCmd}"`;
				} else if (platform === 'darwin') {
					// For macOS
					const gitCmd = relativePath 
						? `git difftool --no-prompt -- "${relativePath}"`
						: 'git difftool --no-prompt';
					command = `cd "${repoAbsPath}" && ${gitCmd}`;
				} else {
					// For Linux - try to detect and use appropriate terminal
					const gitCmd = relativePath 
						? `git difftool --no-prompt -- "${relativePath}"`
						: 'git difftool --no-prompt';
					
					// Check for common Linux terminals
					const terminals = [
						{ cmd: "gnome-terminal", args: `-- bash -c "cd '${repoAbsPath}' && ${gitCmd}; echo 'Press Enter to close'; read"` },
						{ cmd: "xterm", args: `-e "cd '${repoAbsPath}' && ${gitCmd}"` },
						{ cmd: "konsole", args: `--noclose -e bash -c "cd '${repoAbsPath}' && ${gitCmd}; echo 'Press Enter to close'; read"` },
						{ cmd: "xfce4-terminal", args: `--hold -e "cd '${repoAbsPath}' && ${gitCmd}"` },
					];
					
					// Try to find an available terminal
					let terminalCommand = '';
					for (const term of terminals) {
						try {
							// Check if the terminal is available
							const checkResult = exec(`which ${term.cmd}`, { encoding: 'utf8' });
							if (checkResult) {
								terminalCommand = `${term.cmd} ${term.args}`;
								break;
							}
						} catch {
							// Terminal not found, try next one
						}
					}
					
					// If no terminal found, fall back to basic command
					command = terminalCommand || `cd "${repoAbsPath}" && ${gitCmd}`;
					
					// Attempt to run in background
					if (command && !command.endsWith('&')) {
						command += ' &';
					}
				}
				
				console.log(`Executing command: ${command}`);
				
				// Execute the command
				exec(command, (error) => {
					if (error) {
						console.error('Failed to open git difftool:', error);
						reject(error);
					} else {
						resolve();
					}
				});
			} catch (error) {
				console.error('Error launching git difftool:', error);
				reject(error);
			}
		});
	}
}
