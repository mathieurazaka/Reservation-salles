/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1473635903")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.id != \"\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1473635903")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.role = \"admin\"\n||\n@request.auth.role = \"logistique\""
  }, collection)

  return app.save(collection)
})
