import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";
import worker from "../src/index";

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("Worker with D1 DB", () => {
	beforeAll(async () => {
		// Initialize the database for tests
		await env.p6.exec(
			"CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT);"
		);
		await env.p6.exec(
			"INSERT INTO users (id, name) VALUES (1, 'Diego Test');"
		);
	});

	it("responds with message and dbData (unit style)", async () => {
		const request = new IncomingRequest("http://example.com");
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);
		
		const data = await response.json();
		expect(data).toHaveProperty("message", "Hello Diego2!");
		expect(data).toHaveProperty("dbData");
		expect(data.dbData).toBeInstanceOf(Array);
		expect(data.dbData.length).toBe(1);
		expect(data.dbData[0].name).toBe("Diego Test");
	});

	it("responds with message and dbData (integration style)", async () => {
		const response = await SELF.fetch("https://example.com");
		const data = await response.json();
		expect(data).toHaveProperty("message", "Hello Diego2!");
		expect(data).toHaveProperty("dbData");
	});
});
