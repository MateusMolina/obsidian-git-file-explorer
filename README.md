# Obsidian Git File Explorer

This plugin integrates Obsidian's file explorer with Git. Once the plugin is enabled, you will see relevant git information next to git repositories found in your vault in the file explorer.

## Features

### Git Changes Widget

- Number of changed files displayed next to each detected repository in the file explorer
- Clicking on the component prompts the user for a commit message. After submitting, the component automatically stages and commits all changes in a single commit.

### Git Sync Widget

- Shows the number of commits to be pulled and pushed from the remote.
- Upon clicking, a sync process is started: pull (--no-rebase) followed by push to remote.
