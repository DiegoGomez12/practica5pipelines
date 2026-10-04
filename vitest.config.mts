import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		cloudflareTest({
			wrangler: { configPath: "./wrangler.jsonc" },
		}),
	],
	test: {
		coverage: {
			provider: "istanbul",
			reporter: ["text", "json", "html"],
		},
		reporters: ["default", "junit"],
		outputFile: {
			junit: "./test-results.xml",
		},
	},
});
