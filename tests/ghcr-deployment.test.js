import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';

const repoRoot = process.cwd();

function readText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('GHCR image deployment', () => {
  test('builds and publishes a reusable NAS Docker image from GitHub Actions', () => {
    const workflowPath = '.github/workflows/docker-ghcr.yml';
    assert.equal(existsSync(path.join(repoRoot, workflowPath)), true);

    const workflow = readText(workflowPath);
    assert.ok(workflow.includes('registry: ghcr.io'));
    assert.ok(workflow.includes('username: ${{ github.actor }}'));
    assert.ok(workflow.includes('password: ${{ secrets.GITHUB_TOKEN }}'));
    assert.ok(workflow.includes('docker/setup-buildx-action'));
    assert.ok(workflow.includes('docker/build-push-action'));
    assert.ok(workflow.includes('push: true'));
    assert.ok(workflow.includes('ghcr.io/${{ github.repository }}:latest'));
    assert.ok(workflow.includes('ghcr.io/${{ github.repository }}:${{ github.sha }}'));
    assert.ok(workflow.includes('build-args:'));
    assert.ok(workflow.includes('GIT_COMMIT=${{ github.sha }}'));
    assert.ok(workflow.includes('BUILD_TIME=${{ github.run_id }}'));
    assert.ok(workflow.includes('packages: write'));
    assert.ok(workflow.includes('workflow_dispatch:'));
  });

  test('provides a generic image compose file for Synology and QNAP NAS UI deployment', () => {
    const composePath = 'docker-compose.image.yml';
    assert.equal(existsSync(path.join(repoRoot, composePath)), true);

    const compose = readText(composePath);
    assert.ok(compose.includes('image: ghcr.io/ddrcpddr/note:latest'));
    assert.ok(!compose.includes('build:'));
    assert.ok(compose.includes('3300:3300'));
    assert.ok(compose.includes('NOTE_DATA_DIR: "/data"'));
    assert.ok(compose.includes('/volume1/docker/home-note/data:/data'));
    assert.ok(compose.includes('NOTE_ACCESS_PIN: "${NOTE_ACCESS_PIN:-}"'));

    const dockerfile = readText('Dockerfile');
    assert.ok(dockerfile.includes('ARG GIT_COMMIT=local'));
    assert.ok(dockerfile.includes('ENV NOTE_BUILD_COMMIT=$GIT_COMMIT'));
  });


  test('defaults Docker containers to China local time while allowing override', () => {
    const dockerfile = readText('Dockerfile');
    const compose = readText('docker-compose.yml');
    const imageCompose = readText('docker-compose.image.yml');
    const nasCompose = readText('docker-compose.nas.yml');

    assert.ok(dockerfile.includes('ENV TZ=Asia/Shanghai'));
    assert.ok(compose.includes('TZ: "${TZ:-Asia/Shanghai}"'));
    assert.ok(imageCompose.includes('TZ: "${TZ:-Asia/Shanghai}"'));
    assert.ok(nasCompose.includes('TZ: "${TZ:-Asia/Shanghai}"'));
  });
  test('documents QNAP and Synology image deployment without storing secrets or real NAS credentials', () => {
    const doc = readText('docs/NAS_IMAGE_DEPLOYMENT.md');
    assert.ok(doc.includes('ghcr.io/ddrcpddr/note:latest'));
    assert.ok(doc.includes('群晖'));
    assert.ok(doc.includes('QNAP'));
    assert.ok(doc.includes('/volume1/docker/home-note/data'));
    assert.ok(doc.includes('/share/Container/home-note/data'));
    assert.ok(doc.includes('不要提交 `.env`'));
    assert.ok(doc.includes('GitHub Packages'));
    assert.ok(doc.includes('public'));
  });
});
