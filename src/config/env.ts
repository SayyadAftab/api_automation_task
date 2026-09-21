import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env and set the value.`,
    );
  }
  return value;
}

export const env = {
  baseUrl: requireEnv('BASE_URL'),
  username: requireEnv('API_USERNAME'),
  password: requireEnv('API_PASSWORD'),
  invalidUsername: requireEnv('API_INVALID_USERNAME'),
  invalidPassword: requireEnv('API_INVALID_PASSWORD'),
};
