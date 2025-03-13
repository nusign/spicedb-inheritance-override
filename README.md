# spicedb-inheritance-override
This repo demonstrates SpiceDB schema that implements Google Drive permission model with inheritance and different type of inheritance (direct member, group member, organization level, etc)

# Layout

- `schema-full.zed` includes all definitions and permissions used in the Picflow system
- `schema-main.zed` short version of full schema that demonstrates only main problem with coarse grained permission and inheritance complexity

You can find tests according to the spicedb schema which you can run by using commands below

# Run

```sh
$ yarn install // Install dependencies

$ yarn test:full // Run tests on full schema

or

$ yarn test:main // Run tests only on gallery and folder entities
```
