import _ from 'lodash'

const CLIENT_STORAGE_KEY_NAME = 'team-library-component-browser'

figma.showUI(__html__)

async function saveLibraryData(): Promise<void> {
  console.log('saveLibraryData')
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

  await figma.clientStorage
    .setAsync(CLIENT_STORAGE_KEY_NAME, newLibrary)
    .then(() => {
      console.log('saveLibraryData success', newLibrary)
    })
    .catch(err => {
      console.error('saveLibraryData failed', err)
    })
}

async function clearLibraryData(): Promise<void> {
  console.log('clearLibraryData')
  await figma.clientStorage
    .setAsync(CLIENT_STORAGE_KEY_NAME, undefined)
    .then(() => {
      console.log('clearLibraryData success')
    })
    .catch(err => {
      console.error('clearLibraryData failed', err)
    })
}

figma.ui.onmessage = async (msg): Promise<void> => {
  const messageType: MessageType = msg.type

  if (messageType === 'save') await saveLibraryData()
  else if (messageType === 'clear') await clearLibraryData()
}
