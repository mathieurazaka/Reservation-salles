/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1317943524")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "bool2266163419",
    "name": "ordinateur",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1317943524")

  // remove field
  collection.fields.removeById("bool2266163419")

  return app.save(collection)
})
