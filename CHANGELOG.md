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
