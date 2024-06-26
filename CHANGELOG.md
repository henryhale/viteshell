# Changelog

## [0.8.1](https://github.com/henryhale/viteshell/compare/v0.8.0...v0.8.1) (2024-04-11)

## [0.8.0](https://github.com/henryhale/viteshell/compare/v0.7.0...v0.8.0) (2024-04-03)


### Features

* add reimplementation of onexit method ([7a972a0](https://github.com/henryhale/viteshell/commit/7a972a0353c5c5e48a667c2eb65eeb76965fdd7b))
* rename init method to reset ([d83d7d9](https://github.com/henryhale/viteshell/commit/d83d7d9b9bdfcce8319b4e917525317c8590ae28))


### Bug Fixes

* **bug:** gracefully terminate large timeouts when task is resolved ([6503dec](https://github.com/henryhale/viteshell/commit/6503dec80a5e3d1fd26357c2eb8c446d3b50c941))
* **bug:** timeouts in seconds as documented ([4203cab](https://github.com/henryhale/viteshell/commit/4203cabbf9626f83e7689c79d7221e0e1f9ed91c))
* improve OR operations and error captures ([aa4f680](https://github.com/henryhale/viteshell/commit/aa4f68014bfa18b0cf710659922f588a4f29cbdf))

## [0.7.0](https://github.com/henryhale/viteshell/compare/v0.6.11...v0.7.0) (2024-01-14)


### Features

* add date command and listCommands method ([82fa4ee](https://github.com/henryhale/viteshell/commit/82fa4ee1144e276aab3a88d6ff7854364ba889c6))

## [0.6.11](https://github.com/henryhale/viteshell/compare/v0.6.10...v0.6.11) (2024-01-05)


### Bug Fixes

* issue [#2](https://github.com/henryhale/viteshell/issues/2) ([e1f72db](https://github.com/henryhale/viteshell/commit/e1f72dbff86f20b4d56863297d6571a96c4ee412))

## [0.6.10](https://github.com/henryhale/viteshell/compare/v0.6.9...v0.6.10) (2023-12-29)

## [0.6.9](https://github.com/henryhale/viteshell/compare/v0.6.8...v0.6.9) (2023-12-29)

## [0.6.8](https://github.com/henryhale/viteshell/compare/v0.6.7...v0.6.8) (2023-12-29)

## [0.6.7](https://github.com/henryhale/viteshell/compare/v0.6.6...v0.6.7) (2023-12-21)

## [0.6.6](https://github.com/henryhale/viteshell/compare/v0.6.5...v0.6.6) (2023-12-19)

## [0.6.5](https://github.com/henryhale/viteshell/compare/v0.6.4...v0.6.5) (2023-12-19)


### Bug Fixes

* onexit callbacks not being invoked on exit ([0053e29](https://github.com/henryhale/viteshell/commit/0053e2966cca07f2bc261fb2987956fb724a0438))

## [0.6.4](https://github.com/henryhale/viteshell/compare/v0.6.3...v0.6.4) (2023-12-18)

## [0.6.3](https://github.com/henryhale/viteshell/compare/v0.6.2...v0.6.3) (2023-12-08)

## [0.6.2](https://github.com/henryhale/viteshell/compare/v0.6.1...v0.6.2) (2023-12-08)


### Bug Fixes

* **bug:** command execution terminated immediately ([c546331](https://github.com/henryhale/viteshell/commit/c546331c457734c0b12b4885220c508ee5cd6b73))
* **bug:** concatenated execution error in compound commands ([e7a7326](https://github.com/henryhale/viteshell/commit/e7a732694b06d28097bb02656101176e995a1c11))

## [0.6.1](https://github.com/henryhale/viteshell/compare/v0.6.0...v0.6.1) (2023-12-08)


### Bug Fixes

* onexit method not found ([987f27d](https://github.com/henryhale/viteshell/commit/987f27dcfd80820e39af35e006967ee5fb9c4539))

# [0.6.0](https://github.com/henryhale/viteshell/compare/v0.5.0...v0.6.0) (2023-12-08)


### Bug Fixes

* flush output stream before activation ([eb3d165](https://github.com/henryhale/viteshell/commit/eb3d165821dafc82497b82210e80f1e09aead7f2))
* update state and remove conflicting operations ([a6e3ef8](https://github.com/henryhale/viteshell/commit/a6e3ef805c3e2e7fc0ad2da43c863607acabe919))


### Features

* add grep command and command examples in docs ([913b742](https://github.com/henryhale/viteshell/commit/913b7422906d28a9f05ef7baf4d026690691122a))
* add writeln() method to output streams ([f17bf77](https://github.com/henryhale/viteshell/commit/f17bf770f330cf20f6db0f82af107f8e6c21f562))
* added default aliases and new builtins ([ef79db3](https://github.com/henryhale/viteshell/commit/ef79db3603de45ff103f87c1469a71942e74f05d))
* set execution timeout for all commands ([c838dc7](https://github.com/henryhale/viteshell/commit/c838dc7caac6e75a929936d89763664e5e666fb9))

# [0.5.0](https://github.com/henryhale/viteshell/compare/v0.4.1...v0.5.0) (2023-10-03)


### Features

* added history stack to process object ([3cea59a](https://github.com/henryhale/viteshell/commit/3cea59a1bfc1e7f5e2c9a84b79171d13d9700a4d))
* added prompt style 2, fixed typos ([0161ac9](https://github.com/henryhale/viteshell/commit/0161ac9ad8b888f6f574ecb21ee03af5e68669e1))

## [0.4.1](https://github.com/henryhale/viteshell/compare/v0.4.0...v0.4.1) (2023-08-21)

# [0.4.0](https://github.com/henryhale/viteshell/compare/v0.0.8...v0.4.0) (2023-08-21)


### Bug Fixes

* capture parsing errors, implement onexit ([ed2bdc8](https://github.com/henryhale/viteshell/commit/ed2bdc849cfd6c07a64a7f7f8ca8d8064ac10ac1))
* **release:** fix a bug in npm ([33dc1cd](https://github.com/henryhale/viteshell/commit/33dc1cd39909886d202bc614772f897456aa27f9))
* **release:** publish next release over the previous one ([6a5eb81](https://github.com/henryhale/viteshell/commit/6a5eb81afe18ff1329d4dbc8c33bf2c5db306feb))
* write raw input without variable substitution ([a2c1178](https://github.com/henryhale/viteshell/commit/a2c11785c4aa107f17af283238d623c7ddd9ab69))


### Features

* added onexit hook ([8b27f08](https://github.com/henryhale/viteshell/commit/8b27f0846235d065655cdacc166d671e827386ab))

##

All notable changes to this project will be documented in this file. Dates are displayed in UTC.

Generated by [`auto-changelog`](https://github.com/CookPete/auto-changelog).

#### [v0.0.8](https://github.com/henryhale/viteshell/compare/v0.0.7...v0.0.8)

- chore(docs): removed merge commit message [`6617445`](https://github.com/henryhale/viteshell/commit/6617445bdbe31fe632061d63e522aa6abbef8bd6)

#### [v0.0.7](https://github.com/henryhale/viteshell/compare/v0.0.6...v0.0.7)

> 21 August 2023

- chore(release): v0.0.7 [`193d502`](https://github.com/henryhale/viteshell/commit/193d502f5c3777219f5d529d9768a9187566d761)
- fix: public api types [`5a376e3`](https://github.com/henryhale/viteshell/commit/5a376e3cf951854e47600ed83f4d496abb8575eb)
- chore(feat): removed irrelevant isBusy method [`4f52331`](https://github.com/henryhale/viteshell/commit/4f52331cec692850a3fb38b63d0adf9c6d1781bc)

#### [v0.0.6](https://github.com/henryhale/viteshell/compare/v0.0.5...v0.0.6)

> 21 August 2023

- chore: remove unused deps [`f094da0`](https://github.com/henryhale/viteshell/commit/f094da0019e343067be8e30e4fc21dd2b6763f41)
- chore(release): v0.0.6 [`ea8dc78`](https://github.com/henryhale/viteshell/commit/ea8dc782b149c06ad38ed0a8823adfd832497436)

#### [v0.0.5](https://github.com/henryhale/viteshell/compare/v0.0.4...v0.0.5)

> 21 August 2023

- chore(release): v0.0.5 [`094adba`](https://github.com/henryhale/viteshell/commit/094adba34b0848fd71f776d3e726ac09639264b4)
- fix(docs): remove details tag and expose links [`fd7770e`](https://github.com/henryhale/viteshell/commit/fd7770e37a772a10d0861e71426015fcae5b3dcb)

#### [v0.0.4](https://github.com/henryhale/viteshell/compare/v0.0.3...v0.0.4)

> 21 August 2023

- chore(release): v0.0.4 [`0ad7d29`](https://github.com/henryhale/viteshell/commit/0ad7d29149feb6558f4510ebdc29b9e553991178)
- chore(docs): fix build badge [`4b434b5`](https://github.com/henryhale/viteshell/commit/4b434b518266ef461a8e3ed0918df957fcf5c674)

#### [v0.0.3](https://github.com/henryhale/viteshell/compare/v0.0.2...v0.0.3)

> 21 August 2023

- initial commit [`a19cc20`](https://github.com/henryhale/viteshell/commit/a19cc20161320bd60b53f062c2daadaa382ea41c)
- chore(release): v0.0.3 [`31db101`](https://github.com/henryhale/viteshell/commit/31db101b8ec0425af2b9cbb0931a228d6118e873)
- initial commit [`a4d6188`](https://github.com/henryhale/viteshell/commit/a4d618827759fbb84f30b5d15757e4e509ef9d90)

#### v0.0.2

> 9 August 2023

- chore: project setup [`778c032`](https://github.com/henryhale/viteshell/commit/778c032afac4a9d2350d028693eafab87c56abab)
- Initial commit [`e3299ac`](https://github.com/henryhale/viteshell/commit/e3299acb036952467d18a61846279806f53d6d45)
- chore(release): v0.0.2 [`adb7fb0`](https://github.com/henryhale/viteshell/commit/adb7fb085bc971f18939bd9eb96a92e723adecff)
