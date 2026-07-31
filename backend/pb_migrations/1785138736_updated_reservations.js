/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
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

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "date2905535025",
    "max": "",
    "min": "",
    "name": "fin",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1473635903")

  // remove field
  collection.fields.removeById("date3894085241")

  // remove field
  collection.fields.removeById("date2905535025")

  return app.save(collection)
})
