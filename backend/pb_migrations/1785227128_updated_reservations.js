/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1473635903")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"enseignant\"\n||\n@request.auth.role = \"association\"\n||\nutilisateur = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1473635903")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"enseignant\"\n||\n@request.auth.role = \"association\""
  }, collection)

  return app.save(collection)
})
