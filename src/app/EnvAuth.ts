import { io } from "socket.io-client";
import dotenv from "dotenv";

export class EnvAuth {
  private readonly GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
  private readonly GITHUB_ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
  private readonly DEFAULT_CALLBACK_SERVER_URL = "https://env-auth.nuve.cc/callback";
  private readonly DEFAULT_SOCKET_SERVER_URL = "wss://env-auth.nuve.cc";

  private CLIENT_ID = "";
  private CLIENT_SECRET = "";
  private UNIQUE_TOKEN = "";
  private GITHUB_ENV_REPOSITORY = "";

  private constructor() {}

  public static builder(): EnvAuth {
    return new EnvAuth();
  }

  public clientId(id: string): EnvAuth {
    this.CLIENT_ID = id;
    return this;
  }

  public clientSecret(secret: string): EnvAuth {
    this.CLIENT_SECRET = secret;
    return this;
  }

  public uniqueToken(token: string): EnvAuth {
    this.UNIQUE_TOKEN = token;
    return this;
  }

  public url(env: string): EnvAuth {
    this.GITHUB_ENV_REPOSITORY = env;
    return this;
  }

  private async getAccessToken(): Promise<string> {
    const socket = io(this.DEFAULT_SOCKET_SERVER_URL, { auth: { token: this.UNIQUE_TOKEN }, transports: ["websocket"] });

    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      redirect_uri: this.DEFAULT_CALLBACK_SERVER_URL,
      state: this.UNIQUE_TOKEN,
      scope: "repo"
    });

    socket.on("connect", () => {
      console.log("🟢 Connected to broker");
      console.log("🔗 Opening GitHub login:", this.GITHUB_AUTH_URL + "?" + params);
    });

    return await new Promise(resolve => {
      socket.on("github", async(value) => {
        console.log("🟢 Github code receipt", value);

        const response: any = await fetch(this.GITHUB_ACCESS_TOKEN_URL, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: this.CLIENT_ID, client_secret: this.CLIENT_SECRET, code: value.code })
        }).then(async response => await response.json());
        socket.disconnect();
        resolve(response.access_token);
      });
    });
  }

  public async loader(): Promise<NodeJS.ProcessEnv> {
    const accessToken = await this.getAccessToken();
    const envContent = await fetch(this.GITHUB_ENV_REPOSITORY, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(async response => await response.text());

    // Inject into process.env
    const config = dotenv.parse(envContent);
    for (const [key, value] of Object.entries(config)) {
      process.env[key] = value;
    }
    return process.env;
  }
}
