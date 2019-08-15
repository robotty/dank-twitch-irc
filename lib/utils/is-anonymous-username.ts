const anonymousUsernameRegex = /^justinfan\d+$/;

export function isAnonymousUsername(username: string): boolean {
  return anonymousUsernameRegex.test(username);
}
