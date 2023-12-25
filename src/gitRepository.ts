import { exec } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

export class GitRepository {
	private repoAbsPath: string;

	private constructor(repoAbsPath: string) {
		this.repoAbsPath = repoAbsPath;
	}

	static async getInstance(repoAbsPath: string): Promise<GitRepository> {
		if (!(await GitRepository.isGitRepo(repoAbsPath)))
			return Promise.reject("Not a git repository");

		return new GitRepository(repoAbsPath);
	}

	static async isGitRepo(fullPath: string): Promise<boolean> {
		const gitDir = join(fullPath, ".git");
		return existsSync(gitDir);
	}

	async getChangedFilesCount(): Promise<number> {
		const cmd = `git -C ${this.repoAbsPath} status --porcelain | wc -l`;
		return new Promise((resolve, reject) => {
			exec(cmd, (error, stdout, stderr) => {
				if (error) {
					console.error(`exec error: ${error}`);
					return reject(error);
				}
				resolve(parseInt(stdout, 10));
			});
		});
	}

	async stageAll(): Promise<void> {
		const cmd = `git -C ${this.repoAbsPath} add .`;
		return new Promise((resolve, reject) => {
			exec(cmd, (error, stdout, stderr) => {
				if (error) {
					console.error(`exec error: ${error}`);
					return reject(error);
				}
				resolve();
			});
		});
	}

	async commit(message: string): Promise<void> {
		const cmd = `git -C ${this.repoAbsPath} commit -m "${message}"`;
		return new Promise((resolve, reject) => {
			exec(cmd, (error, stdout, stderr) => {
				if (error) {
					console.error(`exec error: ${error}`);
					return reject(error);
				}
				resolve();
			});
		});
	}
}
