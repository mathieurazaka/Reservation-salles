/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1473635903")

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2278782907",
    "max": 0,
    "min": 0,
    "name": "motif",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
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

  // remove field
  collection.fields.removeById("text2278782907")

  // remove field
  collection.fields.removeById("select3848597695")

  return app.save(collection)
})
