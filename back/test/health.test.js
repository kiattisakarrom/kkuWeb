const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../app");

test("container liveness is available without DB access; API stays protected", async () => {
  const repository = new Proxy({}, {
    get() { throw new Error("Liveness must not access a repository"); },
  });
  const server = createApp({ repository, jwtSecret: "health-test-only" }).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const health = await fetch(`${base}/healthz`);
    assert.equal(health.status, 200);
    assert.equal(health.headers.get("cache-control"), "no-store");
    assert.deepEqual(await health.json(), { status: "ok" });
    assert.equal((await fetch(`${base}/api/auth`)).status, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
