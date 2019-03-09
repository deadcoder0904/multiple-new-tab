// NOTE: FOR CROSS PLATFORM (CHROME & FIREFOX) COMPATIBILITY 👇
import browser from 'webextension-polyfill'

// HACK: CHECK IF OBJECT IS EMPTY
const isEmpty = obj =>
  Object.keys(obj).length === 0 && obj.constructor === Object

let index,
  extensions = []

// NOTE: GETS CURRENT NEW TABS INDEX POSITION
const getIndex = async () => {
  const store = await browser.storage.sync.get('index')
  index = isEmpty(store) ? 0 : store.index
}

// DONE: GET ALL NEW TAB EXTENSIONS LIST
const getAllExtensionsInfo = async () => {
  const results = await browser.management.getAll()
  extensions = results.filter(extension =>
    extension.permissions.includes('newTabPageOverride'),
  )
}

// NOTE: CALL IT ON EVERY NEW TAB CREATION
const onNewTabCreation = () => {
  enableOneNewTabExtension()
  disableOtherNewTabExtensions()
}

// DONE: SET FIRST EXTENSION AS A NEW TAB WHEN NEW TAB IS CREATED & THEN KEEP ROTATING
const enableOneNewTabExtension = async () => {
  index = (index + 1) % extensions.length

  await browser.management.setEnabled(extensions[index].id, true)
  browser.storage.sync.set({
    index: index + 1,
  })
}

// DONE: DISABLE OTHER NEW TAB EXTENSIONS
const disableOtherNewTabExtensions = async () => {
  extensions.forEach((extension, i) => {
    if (index !== i) browser.management.setEnabled(extension.id, false)
  })
}

const main = () => {
  getIndex()
  getAllExtensionsInfo()
  browser.tabs.onCreated.addListener(onNewTabCreation)
}

main()
