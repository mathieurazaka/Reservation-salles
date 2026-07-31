/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1473635903")

  // remove field
  collection.fields.removeById("date3894085241")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1473635903")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "date3894085241",
    "max": "",
    "min": "",
    "name": "debut",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
})
