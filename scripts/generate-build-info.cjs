const fs = require('fs')
const path = require('path')

const outPath = path.join(__dirname, '..', 'src', 'build-info.json')

// In GitHub Actions, GITHUB_RUN_NUMBER increments forever across pushes/
// dispatches without needing to commit build-info.json back to the repo -
// use it as the build ID there. Locally, fall back to incrementing the
// committed counter file so `npm run build` still bumps a visible number.
let buildId
if (process.env.GITHUB_RUN_NUMBER) {
  buildId = parseInt(process.env.GITHUB_RUN_NUMBER, 10)
} else {
  let previous = { buildId: 0 }
  try {
    previous = JSON.parse(fs.readFileSync(outPath, 'utf-8'))
  } catch {
    // no previous build-info.json yet - start from 0
  }
  buildId = (previous.buildId ?? 0) + 1
}

const buildInfo = { buildId, buildDate: new Date().toISOString() }

fs.writeFileSync(outPath, JSON.stringify(buildInfo, null, 2) + '\n')
console.log(`[build-info] build #${buildInfo.buildId} @ ${buildInfo.buildDate}`)
