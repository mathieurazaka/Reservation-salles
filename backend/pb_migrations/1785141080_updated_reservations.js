/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1473635903")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"enseignant\"\n||\n@request.auth.role = \"association\"",
    "deleteRule": "@request.auth.role = \"admin\"\n||\nutilisateur = @request.auth.id",
    "updateRule": "@request.auth.role = \"admin\"\n||\n@request.auth.role = \"logistique\"\n||\nutilisateur = @request.auth.id",
    "viewRule": "@request.auth.role = \"admin\"\n||\n@request.auth.role = \"logistique\"\n||\nutilisateur = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1473635903")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
