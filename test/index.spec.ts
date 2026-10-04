import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";
import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("Worker with D1 DB", () => {
	beforeAll(async () => {
		await env.p6.exec(
			"CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT);"
		);
		await env.p6.exec(
			"INSERT INTO users (id, name) VALUES (1, 'Diego Test');"
		);
	});

	it("responds with message and dbData (unit style)", async () => {
		const request = new IncomingRequest("http://example.com");
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		
		const data = await response.json();
		expect(data).toHaveProperty("message", "Hello Diego2!");
		expect(data).toHaveProperty("dbData");
		expect(data.dbData).toBeInstanceOf(Array);
		expect(data.dbData.length).toBe(1);
		expect(data.dbData[0].name).toBe("Diego Test");
	});

	it("responds with HTML when requested by browser", async () => {
		const request = new IncomingRequest("http://example.com", {
			headers: { "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9" }
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		
		expect(response.headers.get("Content-Type")).toContain("text/html");
		const html = await response.text();
		expect(html).toContain("<!DOCTYPE html>");
		expect(html).toContain("API En línea");
	});

	it("responds with message and dbData (integration style)", async () => {
		const response = await SELF.fetch("https://example.com");
		const data = await response.json();
		expect(data).toHaveProperty("message", "Hello Diego2!");
		expect(data).toHaveProperty("dbData");
	});
});
