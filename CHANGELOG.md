# Changelog

## edge (unreleased)

- Breaking: Renamed `recipientUserName` to `recipientUsername` in the parameters
  for `subgift` and `anonsubgift` messages to be more consitent with the way
  `username` is camelcased in the rest of the library.
- Bugfix: `UsernoticeMessage.prototype.isAnonSubgift()` how has the correct
  return type for TypeScript users.
- Bugfix: Fixed compile error with typescript in strict mode. `@types/debug` has
  been moved to normal dependencies.
- Documentation: Documented `ChatClient.prototype.timeout()` method
- Documentation: Documented how to handle `USERNOTICE` messages.
- Documentation: Added Table of Contents to `README.md`.

## v2.6.0

- Added `ChatClient.prototype.timeout` method for timing out users
- Added `UsernoticeMessage.prototype.isCheer` and
  `PrivmsgMessage.prototype.isCheer` to quickly check if a message is a cheer.
- Added `UsernoticeMessage.prototype.isAnonSubgift` to check for `anonsubgift`
  messages.
- Fixed typescript compilation errors when using `dank-twitch-irc` from a
  TypeScript project.

## Versions below

There is no changelog available for older versions at this time.
