import simpleGit, { FileStatusResult, SimpleGit } from "simple-git";
import { join } from "path";
import { existsSync } from "fs";
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
}
