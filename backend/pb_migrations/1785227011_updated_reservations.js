/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1473635903")

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "select3848597695",
    "maxSelect": 1,
    "name": "statut",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "En attente",
      "Confirmee",
      "Refusee"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1473635903")

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "select3848597695",
    "maxSelect": 1,
    "name": "statut",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "En attente",
      "Confirmee",
      "Refusee"
    ]
  }))

  return app.save(collection)
})
