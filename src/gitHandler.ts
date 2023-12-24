import { exec } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

export class GitHandler {
	pathPrefix: string;

	constructor(pathPrefix: string) {
		this.pathPrefix = pathPrefix;
	}

	async isGitRepo(path: string): Promise<boolean> {
		const gitDir = join(this.getFullPath(path), ".git");
		return existsSync(gitDir);
	}

	async getChangedFilesCount(path: string): Promise<number> {
		const cmd = `git -C ${this.getFullPath(
			path
		)} status --porcelain | wc -l`;
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

	async stageAll(path: string): Promise<void> {
		const cmd = `git -C ${this.getFullPath(path)} add .`;
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

	async commit(path: string, message: string): Promise<void> {
		const cmd = `git -C ${this.getFullPath(path)} commit -m "${message}"`;
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

	private getFullPath = (path: string) => join(this.pathPrefix, path);
}
