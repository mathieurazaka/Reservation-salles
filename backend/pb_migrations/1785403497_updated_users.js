/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.role = \"admin\"\n||\nid = @request.auth.id",
    "listRule": "@request.auth.role = \"admin\" \n|| \n@request.auth.role = \"logistique\"\n||\nid = @request.auth.id",
    "updateRule": "@request.auth.role = \"admin\"\n||\nid = @request.auth.id",
    "viewRule": "@request.auth.role = \"admin\" \n|| \n@request.auth.role = \"logistique\"\n||\nid = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "deleteRule": "id = @request.auth.id\n||\n@request.auth.role = \"admin\"",
    "listRule": "id = @request.auth.id\n||\n@request.auth.role = \"admin\"",
    "updateRule": "id = @request.auth.id\n||\n@request.auth.role = \"admin\"",
    "viewRule": "id = @request.auth.id\n||\n@request.auth.role = \"admin\""
  }, collection)

  return app.save(collection)
})
