/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1317943524")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"admin\" || @request.auth.role = \"logistique\"",
    "updateRule": "@request.auth.role = \"admin\" || @request.auth.role = \"logistique\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1317943524")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"admin\"",
    "updateRule": "@request.auth.role = \"admin\""
  }, collection)

  return app.save(collection)
})
