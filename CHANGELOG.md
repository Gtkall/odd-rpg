## [0.9.0](https://github.com/Gtkall/odd-rpg/compare/v0.8.0...v0.9.0) (2026-03-27)

### Features

* **items:** filter Create Item dialog to hide unsupported types ([79063e8](https://github.com/Gtkall/odd-rpg/commit/79063e8c7db470694a750f2e1057abc9cb2238c6))
* **items:** implement generic Item type with notes and description ([3dc9622](https://github.com/Gtkall/odd-rpg/commit/3dc9622985c209a269f5fae5b271d83ab6f1fcad))
* **tracker): add scene control button; feat(items:** filter creation dialog types ([a694466](https://github.com/Gtkall/odd-rpg/commit/a6944661399536e58b8e0a013ae840c6e060311a))
* **tracker:** add floating ODD Initiative Tracker ([1195936](https://github.com/Gtkall/odd-rpg/commit/1195936112aff7d27437417a6115fa50a0d48452))

### Bug Fixes

* **tracker:** click-to-open overlay, clean drag ghost, dynamic row height ([d81b327](https://github.com/Gtkall/odd-rpg/commit/d81b327345c4577e7d474e7e907d43f906b3476a))

## [0.8.0](https://github.com/Gtkall/odd-rpg/compare/v0.7.0...v0.8.0) (2026-03-25)

### Features

* **sheets:** isEditMode pass for Combat and Talents/Flaws tabs ([124447b](https://github.com/Gtkall/odd-rpg/commit/124447b458612c47f1b63aa1cc7c575790289ca6))

## [0.7.0](https://github.com/Gtkall/odd-rpg/compare/v0.6.0...v0.7.0) (2026-03-25)

### Features

* **enrichers:** add [[/oddPool]] and [[/oddPenalty]] inline dice tokens ([a818e42](https://github.com/Gtkall/odd-rpg/commit/a818e42672360838a2c844ab783e9f83a72cdd22))
* **enrichers:** add syntax hint tooltip to talent effect editor ([c21fc87](https://github.com/Gtkall/odd-rpg/commit/c21fc87501e5b8c6dbde7bf995dd32e4b8dd5162))

### Bug Fixes

* **combat:** prevent 1H/2H hand label from wrapping in weapon table ([1db9b19](https://github.com/Gtkall/odd-rpg/commit/1db9b193365a0ecb922ab4ad97a4af50fc8f2687))

## [0.6.0](https://github.com/Gtkall/odd-rpg/compare/v0.5.0...v0.6.0) (2026-03-25)

### Features

* **combat:** hit location wound tracker with body diagram ([8bf09ed](https://github.com/Gtkall/odd-rpg/commit/8bf09ed72c7cc008229f823aa88f484dc9a179f4))
* **items:** add Talent item type with tree structure and rich text effects ([d17e7e6](https://github.com/Gtkall/odd-rpg/commit/d17e7e6fdda815368f07b7458b24153508fb4580))
* **talents-flaws:** add expandable detail panels to Talents & Flaws tab ([5b5de34](https://github.com/Gtkall/odd-rpg/commit/5b5de34cbcc63070ebf46251f4bae1f6d680ebad))
* **talents-flaws:** add search, category filter, and fuzzy matching ([79b2a81](https://github.com/Gtkall/odd-rpg/commit/79b2a8192b9d7cb0d6f15605d37cc22abed9abd9))
* **talents-flaws:** add Talent and Flaw item types with Talents & Flaws tab ([63d103d](https://github.com/Gtkall/odd-rpg/commit/63d103d7f1df997ccdf34552491759e8827ea9be))

### Bug Fixes

* **actor:** deduplicate woundLocations build, tighten combatant lookup, fix separator ([84b6f87](https://github.com/Gtkall/odd-rpg/commit/84b6f876ab3b4b243d7358ea3090cac8a893f65d))

## [0.5.0](https://github.com/Gtkall/odd-rpg/compare/v0.4.0...v0.5.0) (2026-03-24)

### Features

* **combat:** encumbrance panel on Combat tab ([989e924](https://github.com/Gtkall/odd-rpg/commit/989e92424a05cdaa575125717d699d5d65e9fddf))
* **combat:** weapon/armor inventory tables and dodge roll panel ([9f66c9e](https://github.com/Gtkall/odd-rpg/commit/9f66c9efe0f6a72411b10ab0e42adee7992ee4cb))
* **sheet:** add edit mode toggle to character sheet ([7bc9f87](https://github.com/Gtkall/odd-rpg/commit/7bc9f87eb2c27b5b9a6edb60623caf490c3ef9d0))
* **skills:** add custom skills to the skills table ([070f67e](https://github.com/Gtkall/odd-rpg/commit/070f67e32d9a91c0c8ce99c216ad7799e40c1cd0))

### Bug Fixes

* **skills:** single separator between skill groups and add section ([2465c3e](https://github.com/Gtkall/odd-rpg/commit/2465c3e011e65f775d8051ba12062daeaa89c119))

## [0.4.0](https://github.com/Gtkall/odd-rpg/compare/v0.3.1...v0.4.0) (2026-03-21)

### Features

* **dice-pool:** add bonus dice buttons to pool tray ([f8ef5a4](https://github.com/Gtkall/odd-rpg/commit/f8ef5a4b0a3663a279e352c63c4d514dee42952b))
* **dice-pool:** roll history, save rolls, and bonus dice buttons ([7ed89de](https://github.com/Gtkall/odd-rpg/commit/7ed89dee06c2194c5821d60a31434dd0139801fd))
* **initiative:** keepHighest resolution + Foundry combat integration ([14b0649](https://github.com/Gtkall/odd-rpg/commit/14b06494765bdba66f126af2527ec2013f2bfbc7))

### Bug Fixes

* improve chat roll card readability and sheet title localization ([0a86341](https://github.com/Gtkall/odd-rpg/commit/0a863412c3ffe108f3e5879ca02c28125cabe10e)), closes [#999](https://github.com/Gtkall/odd-rpg/issues/999)

## [0.3.1](https://github.com/Gtkall/odd-rpg/compare/v0.3.0...v0.3.1) (2026-03-21)

### Bug Fixes

* clear roll modifier when bonus toggle is unchecked ([a9c0176](https://github.com/Gtkall/odd-rpg/commit/a9c0176d0eb08b8cf8b65f136f94c741066595f2))

## [0.3.0](https://github.com/Gtkall/odd-rpg/compare/v0.2.0...v0.3.0) (2026-03-21)

### Features

* **combat:** initiative roll + reusable roll-entry partial with bonus toggle ([9c83907](https://github.com/Gtkall/odd-rpg/commit/9c83907d07dfb7423d9dec29c19965189f038f79))
* **rolls:** add to pool with bonus, singular die labels, roll button styling ([03bef59](https://github.com/Gtkall/odd-rpg/commit/03bef596521f11a0d7734318b40d202cd7476903))
* **rolls:** roll actions on entries, Foundry-native formula resolution ([214d599](https://github.com/Gtkall/odd-rpg/commit/214d5999768ecdd2485658f18198f90e6c2d5419))

### Bug Fixes

* **chat:** show bonus dice in roll breakdown ([013f6ae](https://github.com/Gtkall/odd-rpg/commit/013f6ae8cf52144c76cb644485a9afa1bbe9296e))
* **rolls:** restore bonus dice to pool, extract _resolveBonusFormula ([6871ca0](https://github.com/Gtkall/odd-rpg/commit/6871ca067876b729668d8baef43241151e6836e8))

## [0.2.0](https://github.com/Gtkall/odd-rpg/compare/v0.1.1...v0.2.0) (2026-03-18)

### Features

* add Armor/Shield item type with location multi-select ([e673944](https://github.com/Gtkall/odd-rpg/commit/e673944f96f7f36814253ee1ab892b3b550468be))
* add description field and image file picker to item sheets ([054afb6](https://github.com/Gtkall/odd-rpg/commit/054afb629ceb33caa3421e3462e4e3d2eb593324))
* add edit mode toggle to item sheets ([ec684d4](https://github.com/Gtkall/odd-rpg/commit/ec684d4cf26e83bafd2f2b2365d7bfc3507fe757)), closes [#isEditMode](https://github.com/Gtkall/odd-rpg/issues/isEditMode)
* add Weapon item type with full sheet UI ([63c66b4](https://github.com/Gtkall/odd-rpg/commit/63c66b4154eb64d56939aaeb77a9ae3500b6a9c3))

## [0.1.1](https://github.com/Gtkall/odd-rpg/compare/v0.1.0...v0.1.1) (2026-03-17)

### Bug Fixes

* only enable vite watch mode when --watch flag is passed ([ba01d85](https://github.com/Gtkall/odd-rpg/commit/ba01d8504abb1369bbd8215554250771bde296d9))
* replace ESLint defineConfig with tseslint.config to fix CI ESM interop error ([680c2e8](https://github.com/Gtkall/odd-rpg/commit/680c2e8b66a9e7c64c07d33560c6c960386f4c0c))
