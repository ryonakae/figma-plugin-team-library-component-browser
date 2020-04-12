import _ from 'lodash'
import Store from '@/app/Store'
import Util from '@/app/Util'

const CLIENT_STORAGE_KEY_NAME = 'team-library-component-browser'
const UI_WIDTH = 250
const UI_MIN_HEIGHT = 200
const UI_MAX_HEIGHT = 450
let library: Library = []

figma.showUI(__html__, { width: UI_WIDTH, height: UI_MIN_HEIGHT })

async function saveLibrary(): Promise<void> {
  console.log('saveLibrary', figma.root)

  let pages: FigmaPage[] = []

  // 各ページごとに処理
  _.map(figma.root.children, page => {
    // ページ以下にある、keyがあるコンポーネントをすべて返す
    const foundComponents = page.findAll(node => {
      return node.type === 'COMPONENT' && node.key.length > 0
    })

    if (foundComponents.length > 0) {
      console.log('found library components', foundComponents)
      let components: FigmaComponent[] = []

      _.map(foundComponents, component => {
        components.push({
          name: component.name,
          id: component.id,
          componentKey: (component as ComponentNode).key,
          pageName: page.name,
          documentName: figma.root.name,
          combinedName: `${figma.root.name} / ${page.name} / ${component.name}`
        })
      })

      // コンポーネントをアルファベット順にソート
      components = _.orderBy(components, 'name', 'asc')

      pages.push({
        name: page.name,
        id: page.id,
        components,
        documentName: figma.root.name,
        isCollapsed: true
      })
    }
  })

  // ページをアルファベット順にソート
  pages = _.orderBy(pages, 'name', 'asc')

  const document: FigmaDocument = {
    name: figma.root.name,
    id: figma.root.id,
    pages,
    isCollapsed: false
  }

  console.log('document', document)

  // ページが1つもない→エラーで処理中断
  if (document.pages.length === 0) {
    figma.ui.postMessage({
      type: 'savefailed',
      data: {
        errorMessage: 'Failed to save library. No library components available.'
      }
    } as PluginMessage)
    throw new Error('')
  }

  // 現在保存されているライブラリを取得
  let currentLibrary: Library | undefined = await figma.clientStorage
    .getAsync(CLIENT_STORAGE_KEY_NAME)
    .catch(err => {
      console.error(err)
      figma.ui.postMessage({
        type: 'savefailed',
        data: {
          errorMessage: 'Failed to save library.'
        }
      } as PluginMessage)
      throw new Error(err)
    })
  console.log('currentLibrary', currentLibrary)

  // もしライブラリがすでにある場合、
  // 現在のライブラリから、documentと同じ名前のものを削除
  if (currentLibrary) {
    currentLibrary = _.remove(currentLibrary, currentDocument => {
      console.log(
        currentDocument.name,
        document.name,
        currentDocument.name === document.name
      )
      return currentDocument.name !== document.name
    })
    console.log(
      'same name documents are deleted from currentLibrary',
      currentLibrary
    )
  }

  // 現在のライブラリにdocumentをマージしたものを新しいライブラリとして返す
  let newLibrary = currentLibrary
    ? _.union(currentLibrary, [document])
    : [document]

  // 新しいライブラリをドキュメント名でソートする
  newLibrary = _.orderBy(newLibrary, ['name'], ['asc'])

  console.log('sorted newLibrary', newLibrary)

  library = newLibrary

  // clientStorageに更新したライブラリを保存
  await figma.clientStorage
    .setAsync(CLIENT_STORAGE_KEY_NAME, library)
    .catch(err => {
      console.error(err)
      figma.ui.postMessage({
        type: 'savefailed',
        data: {
          errorMessage: 'Failed to save library.'
        }
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
        type: 'clearfailed',
        data: {
          errorMessage: 'Failed to clear library.'
        }
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

  // 現在のライブラリを取得
  const currentLibrary:
    | Library
    | undefined = await figma.clientStorage
    .getAsync(CLIENT_STORAGE_KEY_NAME)
    .catch(err => {
      console.error(err)
      figma.ui.postMessage({
        type: 'getfailed',
        data: {
          errorMessage: 'Failed to get library.'
        }
      } as PluginMessage)
      throw new Error(err)
    })

  // ローカルのコンポーネント一覧を取得
  let localPages: FigmaPage[] = []

  _.map(figma.root.children, page => {
    const foundLocalComponents = page.findAll(node => {
      return node.type === 'COMPONENT'
    })

    if (foundLocalComponents.length > 0) {
      console.log('found local components', foundLocalComponents)
      let localComponents: FigmaComponent[] = []

      _.map(foundLocalComponents, component => {
        localComponents.push({
          name: component.name,
          id: component.id,
          componentKey: (component as ComponentNode).key,
          pageName: page.name,
          documentName: figma.root.name,
          combinedName: `${figma.root.name} / ${page.name} / ${component.name}`
        })
      })

      // コンポーネントをアルファベット順にソート
      localComponents = _.orderBy(localComponents, 'name', 'asc')

      localPages.push({
        name: page.name,
        id: page.id,
        components: localComponents,
        documentName: figma.root.name,
        isCollapsed: true
      })
    }
  })

  // ページをアルファベット順にソート
  localPages = _.orderBy(localPages, 'name', 'asc')

  // 現在のページの情報をlocalDocumentというオブジェクトに
  const localDocument: FigmaDocument = {
    name: 'Local components',
    id: figma.root.id,
    pages: localPages,
    isCollapsed: false
  }

  // clientStorageに保存されているライブラリと、現在開いているドキュメントをマージする
  // localDocumentは必ずリストの先頭にする
  library = currentLibrary
    ? _.union([localDocument], currentLibrary)
    : [localDocument]

  console.log('getLibrary success', library)
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

// nodeの親がインスタンスかどうかを返す再帰関数
// 親がpage or documentまで遡り、typeがINSTANCEならtrueを返す
function getIsParentInstance(node: SceneNode): boolean {
  if (!node.parent) return false

  if (node.parent.type === 'INSTANCE') {
    return true
  } else if (node.parent.type === 'PAGE' || node.parent.type === 'DOCUMENT') {
    return false
  } else {
    return getIsParentInstance(node.parent)
  }
}

async function createInstance(options: {
  key: FigmaComponent['componentKey']
  name: FigmaComponent['name']
  id: FigmaComponent['id']
  options: {
    isSwap: boolean
    isOriginalSize: boolean
  }
}): Promise<void> {
  console.log('createInstance', options)

  let component!: ComponentNode

  // keyがある場合
  // →ライブラリのコンポーネントなので、そのkeyを元にコンポーネントをload
  if (options.key.length > 0) {
    component = await figma
      .importComponentByKeyAsync(options.key)
      .catch(err => {
        figma.ui.postMessage({
          type: 'createinstancefailed',
          data: {
            errorMessage:
              'Failed to create instance. If not, you need to enable the library you want to use.'
          }
        } as PluginMessage)
        throw new Error(err)
      })

    console.log('import component success', component)
  }
  // keyがない場合
  // ローカルのコンポーネントなので、現在のドキュメントから同じ名前とidのものを取得してcomponent変数に入れる
  else {
    const localComponent = figma.root.findOne(node => {
      return (
        node.type === 'COMPONENT' &&
        node.name === options.name &&
        node.id === options.id
      )
    })

    // コンポーネントが見つからなかったらエラーをthrow
    if (!localComponent) {
      figma.ui.postMessage({
        type: 'createinstancefailed',
        data: {
          errorMessage: 'Failed to create instance. No local components.'
        }
      } as PluginMessage)
      throw new Error('Failed to create instance. No local components.')
    }

    component = localComponent as ComponentNode

    console.log('found localComponent', component)
  }

  // create instance from component
  const instance = component.createInstance()
  console.log('instance', instance)

  // get selections
  const selections = figma.currentPage.selection
  console.log('selections', selections)

  // なにも選択してない→ドキュメントのルートに挿入
  if (selections.length === 0) {
    // なにもしない
    console.log('no selection, so instance is inserted to document root')

    // 現在のselectionをインスタンスにする
    figma.currentPage.selection = [instance]
  }
  // 1つ以上選択している→selectionごとに処理を実行
  else {
    const newSelections: SceneNode[] = []

    _.map(selections, selection => {
      console.log('selection', selection)

      // 選択した要素の親を取得
      const parent = selection.parent
      console.log('parent', parent)

      // 親がない→処理を中断
      if (!parent) return

      // 選択した要素がインスタンスで、親もインスタンスの場合
      // →要素の削除や追加はできないので、選択した要素のmaster componentを変更する
      // つまり、強制的にswap
      if (getIsParentInstance(selection)) {
        console.log('both selection and parent node is instance.')
        ;(selection as InstanceNode).masterComponent = component

        // 現在のselectionをそのままnewSelectionに入れる
        newSelections.push(selection)
      }
      // それ以外の場合
      else {
        // インスタンスを複製
        const copiedInstance = instance.clone()

        // 選択した要素のインデックスを取得
        const index = _.findIndex(parent.children, (child): boolean => {
          return child.id === selection.id
        })
        console.log('index', index)

        // 取得したインデックスを元に、選択した要素の後にインスタンスを移動
        // ※配列的には後、Figmaの表示では上
        parent.insertChild(index + 1, copiedInstance)

        // isSwapがtrue→selectionを削除
        if (options.options.isSwap) {
          console.log('swap copied instance')

          // isOriginalSizeがfalse→selectionのサイズをインスタンスのサイズにする
          if (!options.options.isOriginalSize) {
            console.log('resize copied instance')
            copiedInstance.resize(selection.width, selection.height)
          }

          // instanceの色んなプロパティを選択した要素と同じにする
          // Scene node properties
          copiedInstance.visible = selection.visible
          copiedInstance.locked = selection.locked
          // // Frame properties
          // if (
          //   selection.type === 'GROUP' ||
          //   selection.type === 'FRAME' ||
          //   selection.type === 'COMPONENT' ||
          //   selection.type === 'INSTANCE'
          // ) {
          //   copiedInstance.clipsContent = selection.clipsContent
          //   copiedInstance.guides = selection.guides
          //   copiedInstance.layoutGrids = selection.layoutGrids
          //   copiedInstance.gridStyleId = selection.gridStyleId
          // }
          // if (
          //   selection.type === 'FRAME' ||
          //   selection.type === 'COMPONENT' ||
          //   selection.type === 'INSTANCE'
          // ) {
          //   copiedInstance.layoutMode = selection.layoutMode
          //   copiedInstance.counterAxisSizingMode =
          //     selection.counterAxisSizingMode
          //   copiedInstance.horizontalPadding = selection.horizontalPadding
          //   copiedInstance.verticalPadding = selection.verticalPadding
          //   copiedInstance.itemSpacing = selection.itemSpacing
          // }
          // // Container-related properties
          // if (
          //   selection.type === 'GROUP' ||
          //   selection.type === 'FRAME' ||
          //   selection.type === 'COMPONENT' ||
          //   selection.type === 'INSTANCE'
          // ) {
          //   copiedInstance.backgrounds = selection.backgrounds
          //   copiedInstance.backgroundStyleId = selection.backgroundStyleId
          // }
          // // Geometry-related properties
          // if (
          //   selection.type === 'FRAME' ||
          //   selection.type === 'COMPONENT' ||
          //   selection.type === 'INSTANCE' ||
          //   selection.type === 'RECTANGLE' ||
          //   selection.type === 'LINE' ||
          //   selection.type === 'ELLIPSE' ||
          //   selection.type === 'POLYGON' ||
          //   selection.type === 'STAR' ||
          //   selection.type === 'VECTOR' ||
          //   selection.type === 'TEXT'
          // ) {
          //   copiedInstance.fills = selection.fills
          //   copiedInstance.strokes = selection.strokes
          //   copiedInstance.strokeWeight = selection.strokeWeight
          //   // copiedInstance.strokeMiterLimit = selection.strokeMiterLimit
          //   copiedInstance.strokeAlign = selection.strokeAlign
          //   copiedInstance.strokeCap = selection.strokeCap
          //   copiedInstance.strokeJoin = selection.strokeJoin
          //   copiedInstance.dashPattern = selection.dashPattern
          //   copiedInstance.fillStyleId = selection.fillStyleId
          //   copiedInstance.strokeStyleId = selection.strokeStyleId
          // }
          // // Corner-related properties
          // if (
          //   selection.type === 'FRAME' ||
          //   selection.type === 'COMPONENT' ||
          //   selection.type === 'INSTANCE' ||
          //   selection.type === 'RECTANGLE' ||
          //   selection.type === 'ELLIPSE' ||
          //   selection.type === 'POLYGON' ||
          //   selection.type === 'STAR' ||
          //   selection.type === 'VECTOR'
          // ) {
          //   copiedInstance.cornerRadius = selection.cornerRadius
          //   copiedInstance.cornerSmoothing = selection.cornerSmoothing
          // }
          // if (
          //   selection.type === 'FRAME' ||
          //   selection.type === 'COMPONENT' ||
          //   selection.type === 'INSTANCE' ||
          //   selection.type === 'RECTANGLE'
          // ) {
          //   copiedInstance.topLeftRadius = selection.topLeftRadius
          //   copiedInstance.topRightRadius = selection.topRightRadius
          //   copiedInstance.bottomLeftRadius = selection.bottomLeftRadius
          //   copiedInstance.bottomRightRadius = selection.bottomRightRadius
          // }
          // // Blend-related properties
          // if (
          //   selection.type === 'GROUP' ||
          //   selection.type === 'FRAME' ||
          //   selection.type === 'COMPONENT' ||
          //   selection.type === 'INSTANCE' ||
          //   selection.type === 'RECTANGLE' ||
          //   selection.type === 'LINE' ||
          //   selection.type === 'ELLIPSE' ||
          //   selection.type === 'POLYGON' ||
          //   selection.type === 'STAR' ||
          //   selection.type === 'VECTOR' ||
          //   selection.type === 'TEXT'
          // ) {
          //   copiedInstance.opacity = selection.opacity
          //   copiedInstance.blendMode = selection.blendMode
          //   copiedInstance.isMask = selection.isMask
          //   copiedInstance.effects = selection.effects
          //   copiedInstance.effectStyleId = selection.effectStyleId
          // }
          // Layout-related properties
          copiedInstance.relativeTransform = selection.relativeTransform
          copiedInstance.x = selection.x
          copiedInstance.y = selection.y
          copiedInstance.rotation = selection.rotation
          copiedInstance.layoutAlign = selection.layoutAlign
          if (
            selection.type === 'FRAME' ||
            selection.type === 'COMPONENT' ||
            selection.type === 'INSTANCE' ||
            selection.type === 'RECTANGLE' ||
            selection.type === 'LINE' ||
            selection.type === 'ELLIPSE' ||
            selection.type === 'POLYGON' ||
            selection.type === 'STAR' ||
            selection.type === 'VECTOR' ||
            selection.type === 'TEXT'
          ) {
            copiedInstance.constraints = selection.constraints
          }
          // Export-related properties
          copiedInstance.exportSettings = selection.exportSettings

          selection.remove()
        }

        // copiedInstanceをnewSelectionに入れる
        newSelections.push(copiedInstance)
      }
    })

    // map関数内で複製した元のインスタンスを削除
    instance.remove()

    // 現在のselectionをnewSelectionsにする
    figma.currentPage.selection = newSelections
  }

  console.log('create instance success', instance)
  figma.ui.postMessage({
    type: 'createinstancesuccess'
  } as PluginMessage)
}

function resizeUI(height: number): void {
  let _height = height
  if (height < UI_MIN_HEIGHT) {
    _height = UI_MIN_HEIGHT
  }
  if (height > UI_MAX_HEIGHT) {
    _height = UI_MAX_HEIGHT
  }

  figma.ui.resize(UI_WIDTH, _height)
}

function setOptions(options: {
  isSwap: Store['isSwap']
  isOriginalSize: Store['isOriginalSize']
}): void {
  figma.root.setPluginData('isSwap', String(options.isSwap))
  figma.root.setPluginData('isOriginalSize', String(options.isOriginalSize))

  figma.ui.postMessage({
    type: 'setoptionssuccess'
  } as PluginMessage)

  console.log(
    'setOptions success',
    figma.root.getPluginData('isSwap'),
    figma.root.getPluginData('isOriginalSize')
  )
}

function getOptions(): void {
  const isSwap = Util.toBoolean(figma.root.getPluginData('isSwap'))
  const isOriginalSize = Util.toBoolean(
    figma.root.getPluginData('isOriginalSize')
  )

  figma.ui.postMessage({
    type: 'getoptionssuccess',
    data: {
      isSwap,
      isOriginalSize
    }
  } as PluginMessage)

  console.log('getOptions success', isSwap, isOriginalSize)
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
      name: msg.data.name,
      id: msg.data.id,
      options: msg.data.options
    })
  } else if (msg.type === 'resize') {
    resizeUI(msg.data.height)
  } else if (msg.type === 'getoptions') {
    getOptions()
  } else if (msg.type === 'setoptions') {
    setOptions({
      isSwap: msg.data.isSwap,
      isOriginalSize: msg.data.isOriginalSize
    })
  }
}
