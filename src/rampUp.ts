import fs from 'fs';
import { GitConfig, init, fetch, readObject } from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import createModuleLogger from './logger';

const logger = createModuleLogger('Ramp Up');

// Initialize the git repository
async function initializeGitRepository() {
  const config: GitConfig = {
    fs,
    http,
  };
  await init(config);
}

// download the README content
async function downloadReadme(owner: string, repo: string): Promise<string | null> {
  const config: GitConfig = {
    fs,
    http,
    onAuth: () => ({
      // Use OAuth token for authentication (recommended)
      token: process.env.GITHUB_TOKEN,
    }),
  };

  try {
    await fetch({
      ...config,
      url: `https://github.com/${owner}/${repo}.git`,
    });

    const { object: { blob: content } } = await readObject(config, {
      dir: `./${repo}`, // needs to be changed to the appropriate directory
      oid: 'HEAD:README.md', // have to use the correct path to the README file, I can change this
    });

    return Buffer.from(content).toString('utf-8');
  } catch (error) {
    logger.error(`Failed to download README for ${repo}. Error: ${error.message}`);
    return null;
  }
}

export async function rampUp(url: string): Promise<number> {
  const urlParts = url.split('/');
  const repo = urlParts.pop();
  const owner = urlParts.pop();

  await initializeGitRepository();
  const readme = await downloadReadme(owner, repo);

  if (!readme) {
    logger.info(`Couldn't get readme for rampUp. Score of 0`);
    return 0;
  }

  const readmeLines = readme.split('\n').length;

  // Readme length score calculation
  let score = 0;
  if (readmeLines > 0) {
    score += 0.2 * Math.min(readmeLines / 200, 1);
  }

  // Keywords score calculation using regex pattern
  const keywordPattern = /Installation|Features|Quick Start|Wiki|Guide|Examples/gi;
  const matches = readme.match(keywordPattern);

  if (matches) {
    // Use a Set to eliminate duplicate matches, then get the unique count
    const uniqueMatches = new Set(matches.map((match) => match.toLowerCase()));
    score += 0.16 * uniqueMatches.size;
  }

  if (score > 1) {
    return 1;
  }
  return score;
}
