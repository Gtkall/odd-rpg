/**
 * World data migrations, run in order by a GM on world load when the system updates.
 *
 * Add one entry per release that changes stored data, in ascending version order.
 * Every world starts at schemaVersion 0.0.0, so new worlds run all migrations too:
 * each `fn` must be safe on data that is already in the new shape.
 * Per-document field renames belong in the data model's static `migrateData` instead.
 */

import { createMigrationRunner } from "@vttforge/core";

export const migrations = createMigrationRunner({
  packageId: "odd-rpg",
  migrations: [],
});
