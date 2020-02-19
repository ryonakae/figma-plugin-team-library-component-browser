import _ from 'lodash'

const CLIENT_STORAGE_KEY_NAME = 'team-library-component-browser'
let library: Library = []

figma.showUI(__html__)

async function saveLibrary(): Promise<void> {
  console.log('saveLibrary')
  const pages: Page[] = []

  figma.root.children.forEach(page => {
    const components: Component[] = []

    page.children.forEach(scene => {
      if (scene.type === 'COMPONENT') {
        components.push({
          name: scene.name,
          id: scene.id,
          key: scene.key
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
    })
    .catch(err => {
      console.error('saveLibrary failed', err)
    })
}

async function clearLibrary(): Promise<void> {
  console.log('clearLibrary')

  library = []

  await figma.clientStorage
    .setAsync(CLIENT_STORAGE_KEY_NAME, library)
    .then(() => {
      console.log('clearLibrary success')
    })
    .catch(err => {
      console.error('clearLibrary failed', err)
    })
}

async function getLibrary(): Promise<void> {
  console.log('getLibrary')

  const currentLibrary:
    | Library
    | undefined = await figma.clientStorage.getAsync(CLIENT_STORAGE_KEY_NAME)

  library = currentLibrary ? currentLibrary : []

  console.log('getLibrary success', currentLibrary)
}

function updateLibrary(): void {
  figma.ui.postMessage({
    type: 'update',
    data: library
  })
}

figma.ui.onmessage = async (msg): Promise<void> => {
  const messageType: MessageType = msg.type

  if (messageType === 'save') {
    await saveLibrary()
    updateLibrary()
  } else if (messageType === 'clear') {
    await clearLibrary()
    updateLibrary()
  } else if (messageType === 'get') {
    await getLibrary()
    updateLibrary()
  }
}
