import { exec } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

// TODO find a lib to do this instead..
export class GitRepository {
	private repoAbsPath: string;
	private remoteBranch: string;

	private constructor(repoAbsPath: string) {
		this.repoAbsPath = repoAbsPath;
	}

	async setup() {
		this.remoteBranch = await this.getRemoteBranch().catch(
			() => "origin/main"
		);
	}

	static async getInstance(repoAbsPath: string): Promise<GitRepository> {
		if (!(await GitRepository.isGitRepo(repoAbsPath))) {
			throw new Error("Not a git repository @ " + repoAbsPath);
		}

		const gitRepository = new GitRepository(repoAbsPath);
		await gitRepository.setup();

		return gitRepository;
	}

	static async isGitRepo(fullPath: string): Promise<boolean> {
		const gitDir = join(fullPath, ".git");
		return existsSync(gitDir);
	}

	async getChangedFilesCount(): Promise<number> {
		const stdout = await this.executeGitCommand(
			`status --porcelain | wc -l`
		);
		return parseInt(stdout, 10);
	}

	async getToPullCommitsCount(): Promise<number> {
		await this.fetchOrigin();
		const stdout = await this.executeGitCommand(
			`rev-list --count HEAD..${this.remoteBranch}`
		);
		return parseInt(stdout, 10);
	}

	async getToPushCommitsCount(): Promise<number> {
		const stdout = await this.executeGitCommand(
			`rev-list --count ${this.remoteBranch}..HEAD`
		);
		return parseInt(stdout, 10);
	}

	async stageAll(): Promise<void> {
		await this.executeGitCommand(`add .`);
	}

	async commit(message: string): Promise<void> {
		await this.executeGitCommand(`commit -m "${message}"`);
	}

	async fetchOrigin(): Promise<void> {
		await this.executeGitCommand(`fetch origin`);
	}

	async getRemoteBranch(): Promise<string> {
		const verifyBranch = async (branch: string) => {
			return await this.executeGitCommand(
				`show-ref --verify --quiet refs/remotes/${branch}`
			).then(() => branch);
		};

		return await this.executeGitCommand(
			`rev-parse --abbrev-ref --symbolic-full-name @{u}`
		)
			.catch(() => verifyBranch("origin/main"))
			.catch(() => verifyBranch("origin/master"))
			.catch(() => {
				throw new Error("No remote branch found");
			});
	}

	async pushToOrigin(): Promise<void> {
		await this.executeGitCommand(
			`push ${this.remoteBranch.split("/").join(" ")}`
		);
	}

	async pullToOrigin(): Promise<void> {
		await this.executeGitCommand(
			`pull ${this.remoteBranch.split("/").join(" ")} --no-edit --rebase`
		);
	}

	async sync(): Promise<void> {
		await this.pullToOrigin();
		await this.pushToOrigin();
	}

	private async executeGitCommand(cmd: string): Promise<string> {
		return new Promise((resolve, reject) => {
			exec(
				`git -C ${this.repoAbsPath} ` + cmd,
				(error, stdout, stderr) => {
					if (error) {
						reject(error + ", with error " + stderr);
					} else {
						resolve(stdout.trim());
					}
				}
			);
		});
	}
}
