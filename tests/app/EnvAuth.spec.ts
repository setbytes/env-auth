import fs from "fs";
import dotenv from "dotenv";
import { EnvAuth } from "@/index";
import crypto from "crypto";

describe("EnvAuth", () => {
  it("should load env from github", async() => {
    const env = dotenv.parse(fs.readFileSync(".env"));
    const res = await EnvAuth.builder()
      .clientId(env.GITHUB_CLIENT_ID)
      .clientSecret(env.GITHUB_CLIENT_SECRET)
      .uniqueToken(crypto.randomUUID())
      .url(env.GITHUB_ENV_REPOSITORY)
      .loader();
    expect(res).toBeTruthy();
  });
});
