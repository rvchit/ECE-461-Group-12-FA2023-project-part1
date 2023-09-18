import git from 'isomorphic-git';
import fs from 'fs';
import os from 'os';
import path from 'path';
import dotenv from 'dotenv';
import createModuleLogger from './logger';
import nodeFetch from 'node-fetch';

dotenv.config();
const logger = createModuleLogger('Ramp Up');

export async function rampUp(url: string): Promise<number> {
  const urlParts = url.split('/');
  const repo = urlParts.pop();
  const owner = urlParts.pop();
  const tempDir = path.join(os.tmpdir(), `repo-${Date.now()}`);
  
  try {
    await fs.promises.mkdir(tempDir);
    await git.clone({
      fs,
      http: nodeFetch,
      dir: tempDir,
      url: `https://github.com/${owner}/${repo}.git`,
      singleBranch: true,
      depth: 1,
    });
    
    const readmePath = path.join(tempDir, 'README.md');
    if (!fs.existsSync(readmePath)) {
      logger.info("Couldn't get readme for rampUp. Score of 0");
      return 0;
    }
    
    const readme = await fs.promises.readFile(readmePath, 'utf-8');
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
      // use a Set to eliminate duplicate matches, then get the unique count
      const uniqueMatches = new Set(matches.map((match) => match.toLowerCase()));
      score += 0.16 * uniqueMatches.size;
    }

    // if score is greater than 1, return 1
    return Math.min(score, 1);
  } catch (error) {
    logger.error('Error during rampUp', error);
    throw error;
  } finally {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  }
}
