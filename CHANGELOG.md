# Changelog

## Unversioned

## v4.0.0

- Major: Removed support for chat rooms. Attempting to join a Twitch `chatrooms:` channel will result in a validation error.
- Minor: Added `flags` and `flagsRaw` properties to `PrivmsgMessage` and `UsernoticeMessage` classes, allowing inspection of AutoMod message rating results. (#38)
- Minor: Added parsing support for newer usernotice parameters (`msg-param-gift-months`, `msg-param-sender-count`)
- Bugfix (**Potentially breaking, check your application**): In subgift and similar USERNOTICE messages, `recipientUserName` is now correctly camelcased as `recipientUsername` as was documented.
- Bugfix: Emotes occurring after emojis are now correctly parsed (#35)
- Bugfix: Messages with wrong emote indices (sent by Twitch) are now handled gracefully instead of failing the message parser. (#22)

## v3.3.0

- Minor: Updated dependencies
- Bugfix: To work around unsanitized data returned by Twitch, display names are now always trimmed of leading and trailing spaces (#33).

## v3.2.6

- Bugfix: Make regex in color parser compatible with older regex engines (e.g. older browsers)

## v3.2.5

- Bugfix: Replace regex-based string parsing with discrete string message parsing

## v3.2.4

- Bugfix: Generated build output (typescript definition files) no longer needs to be manually edited to work correctly when included by other projects

## v3.2.3

- Bugfix: Include `lib` in distribution package to make sure source maps work correctly

## v3.2.2

- Bugfix: Moved `simple-websocket` to production dependencies

## v3.2.1

- Minor: updated dependencies
- Bugfix: Fixed compile errors on latest typescript

## v3.2.0

- Added setColor method to ChatClient

## v3.1.2

- Bugfix: Include updated package-lock file

## v3.1.1

- Bugfix: Updated README to reflect changes introduced in v3.1.0.

## v3.1.0

- Minor: Updated default config values to different, now well-tested defaults
- Minor: Updated README with more concrete instructions for configuration
- Minor: Updated dependencies

## v3.0.7

Only internal changes

## v3.0.6

- Bugfix: Updated typescript and depdencies, fixing build errors with newer typescript versions

## v3.0.5

- Bugfix: Fixed client totally disconnecting if login attempt failed due to connection problems

## v3.0.4

- Minor: Improved performance of the tags parser.

## v3.0.3

- Bugfix: Removed dependency on `lodash.sortby`.

## v3.0.2

- Documentation: removed `<summary>` collapse area in `README.md`.

## v3.0.1

- Documentation fix in readme: `msg.eventParams` instead of `msg.msgParams`.

## v3.0.0

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
