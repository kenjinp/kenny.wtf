
async function getGitHash () {
  const cmd = ["git", "rev-parse", "HEAD"];
  const p = Deno.run({ cmd });
  return await p.status().toString().trim()
}

export const title = "Kenny.wtf"
export const layout = "layout.njk"
export const deploymentDate = new Date();
export const deploymentGitHash = getGitHash()