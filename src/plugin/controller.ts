import _ from 'lodash'

const CLIENT_STORAGE_KEY_NAME = 'team-library-component-browser'
let library: Library = []

figma.showUI(__html__, { width: 250 })

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
    .catch(err => {
      figma.ui.postMessage({
        type: 'savefailed'
      } as PluginMessage)
      throw new Error(err)
    })

  console.log('saveLibrary success', library)
  figma.ui.postMessage({
    type: 'savesuccess',
    data: library
  } as PluginMessage)
}

async function clearLibrary(): Promise<void> {
  console.log('clearLibrary')

  library = []

  await figma.clientStorage
    .setAsync(CLIENT_STORAGE_KEY_NAME, library)
    .catch(err => {
      figma.ui.postMessage({
        type: 'clearfailed'
      } as PluginMessage)
      throw new Error(err)
    })

  console.log('clearLibrary success')
  figma.ui.postMessage({
    type: 'clearsuccess'
  } as PluginMessage)
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

async function createInstance(options: {
  key: FigmaComponent['componentKey']
  options: {
    isSwap: boolean
    isOriginalSize: boolean
  }
}): Promise<void> {
  console.log('createInstance', options)

  // load component
  const component = await figma
    .importComponentByKeyAsync(options.key)
    .catch(err => {
      throw new Error(err)
    })
  console.log('import component success', component)

  // create instance from component
  const instance = component.createInstance()

  // get selections
  const selections = figma.currentPage.selection
  console.log('selections', selections)

  // なにも選択してない→ドキュメントのルートに挿入
  if (selections.length === 0) {
    // なにもしない
  }
  // 1つ以上選択している→selectionごとに処理を実行
  else {
    selections.map(selection => {
      console.log('selection', selection)

      // 選択した要素の親を取得
      const parent = selection.parent
      console.log('parent', parent)

      // 親がない→処理を中断
      if (!parent) return

      // インスタンスを複製
      const copiedInstance = instance.clone()

      // 選択した要素のインデックスを取得
      const index = _.findIndex(parent.children, (child): boolean => {
        return child.id === selection.id
      })
      console.log('index', index)

      // 取得したインデックスを元に、選択した要素の後にインスタンスを移動
      // ※配列的には後、Figmaの表示では上
      parent.insertChild(index, copiedInstance)

      // isOriginalSizeがfalse→selectionのサイズをインスタンスのサイズにする
      if (!options.options.isOriginalSize) {
        copiedInstance.resize(selection.width, selection.height)
      }

      // isSwapがtrue→selectionを削除
      if (options.options.isSwap) {
        // instanceの色んなプロパティを選択した要素と同じにする
        // Scene node properties
        copiedInstance.visible = selection.visible
        copiedInstance.locked = selection.locked
        // Layout-related properties
        copiedInstance.relativeTransform = selection.relativeTransform
        copiedInstance.x = selection.x
        copiedInstance.y = selection.y
        copiedInstance.rotation = selection.rotation
        copiedInstance.layoutAlign = selection.layoutAlign
        // Export-related properties
        copiedInstance.exportSettings = selection.exportSettings

        selection.remove()
      }
    })

    // map関数内で複製した元のインスタンスを削除
    instance.remove()
  }

  console.log('create instance success', instance)
  figma.ui.postMessage({
    type: 'createinstancesuccess'
  } as PluginMessage)
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
    await createInstance({
      key: msg.data.key,
      options: msg.data.options
    })
  }
}
