import _ from 'lodash'

const CLIENT_STORAGE_KEY_NAME = 'team-library-component-browser'
let library: Library = []

figma.showUI(__html__)

async function saveLibrary(): Promise<void> {
  console.log('saveLibrary')
  const pages: FigmaPage[] = []

  figma.root.children.forEach(page => {
    const components: FigmaComponent[] = []

    page.children.forEach(scene => {
      if (scene.type === 'COMPONENT') {
        components.push({
          name: scene.name,
          id: scene.id,
          componentKey: scene.key
        })
      }
    })

    pages.push({
      name: page.name,
      id: page.id,
      components
    })
  })

  const document: FigmaDocument = {
    name: figma.root.name,
    id: figma.root.id,
    pages
  }

  const currentLibrary:
    | Library
    | undefined = await figma.clientStorage.getAsync(CLIENT_STORAGE_KEY_NAME)

  const newLibrary = currentLibrary
    ? _.unionBy(currentLibrary, [document], 'name')
    : [document]

  library = newLibrary

  await figma.clientStorage
    .setAsync(CLIENT_STORAGE_KEY_NAME, library)
    .then(() => {
      console.log('saveLibrary success', library)
      figma.ui.postMessage({
        type: 'savesuccess',
        data: library
      } as PluginMessage)
    })
    .catch(err => {
      console.error('saveLibrary failed', err)
      figma.ui.postMessage({
        type: 'savefailed'
      } as PluginMessage)
    })
}

async function clearLibrary(): Promise<void> {
  console.log('clearLibrary')

  library = []

  await figma.clientStorage
    .setAsync(CLIENT_STORAGE_KEY_NAME, library)
    .then(() => {
      console.log('clearLibrary success')
      figma.ui.postMessage({
        type: 'clearsuccess'
      } as PluginMessage)
    })
    .catch(err => {
      console.error('clearLibrary failed', err)
      figma.ui.postMessage({
        type: 'clearfailed'
      } as PluginMessage)
    })
}

async function getLibrary(): Promise<void> {
  console.log('getLibrary')

  const currentLibrary:
    | Library
    | undefined = await figma.clientStorage.getAsync(CLIENT_STORAGE_KEY_NAME)

  library = currentLibrary ? currentLibrary : []

  console.log('getLibrary success', currentLibrary)
  figma.ui.postMessage({
    type: 'getsuccess'
  } as PluginMessage)
}

function updateLibrary(): void {
  console.log('updateLibrary', library)
  figma.ui.postMessage({
    type: 'update',
    data: library
  } as PluginMessage)
}

async function createInstance(
  key: FigmaComponent['componentKey']
): Promise<void> {
  console.log('createInstance', key)

  await figma.importComponentByKeyAsync(key).then(component => {
    console.log('import component success', component)
  })
}

figma.ui.onmessage = async (msg: PluginMessage): Promise<void> => {
  if (msg.type === 'save') {
    await saveLibrary()
    updateLibrary()
  } else if (msg.type === 'clear') {
    await clearLibrary()
    updateLibrary()
  } else if (msg.type === 'get') {
    await getLibrary()
    updateLibrary()
  } else if (msg.type === 'createinstance') {
    await createInstance(msg.data.key)
  }
}
