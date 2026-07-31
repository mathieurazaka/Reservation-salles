/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1473635903")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "bool380394350",
    "name": "validation",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1473635903")

  // remove field
  collection.fields.removeById("bool380394350")

  return app.save(collection)
})
