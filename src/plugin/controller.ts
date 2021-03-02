import _ from 'lodash'
import Store from '@/app/Store'
import Util from '@/app/Util'

const CLIENT_STORAGE_KEY_NAME = 'team-library-component-browser'
const UI_WIDTH = 300
const UI_MIN_HEIGHT = 200
const UI_MAX_HEIGHT = 500

class Controller {
  private library: Library = []

  getOptions(): void {
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

  setOptions(options: {
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

  formatComponentName(component: SceneNode): string {
    let name = component.name

    // 前後の余白をトルツメ
    // スラッシュの前後のスペースをトルツメ
    name = name.trim().replace(/[ 　]*\/[ 　]*/g, '/')

    // Variants対応
    if (
      component.parent &&
      component.parent.type === ('COMPONENT_SET' as any)
    ) {
      // イコールとカンマの前後のスペースをトルツメ
      name = name.replace(/[ 　]*,[ 　]*/g, ',').replace(/[ 　]*=[ 　]*/g, '=')

      // 「Hoge=Fuga」を「Fuga」に整形して、カンマで区切る
      const properties: string[] = []
      name.split(',').map(s => {
        return properties.push(s.split('=')[1])
      })
      name = properties.join(',')
    }

    return name
  }

  async getLibrary(): Promise<void> {
    console.log('getLibrary')

    // まずライブラリを空にする
    this.library = []

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

        // localComponentという配列にコンポーネントを追加していく
        let localComponents: FigmaComponent[] = []

        _.map(foundLocalComponents, component => {
          let componentName = this.formatComponentName(component)

          // 親のtypeがCOMPONENT_SET、つまりVariantsの場合、名前を変える
          const componentParent = component.parent
          if (
            componentParent &&
            componentParent.type === ('COMPONENT_SET' as any)
          ) {
            componentName = `${componentParent.name}/${componentName}`
          }

          localComponents.push({
            name: componentName,
            id: component.id,
            componentKey: (component as ComponentNode).key,
            pageName: page.name,
            documentName: figma.root.name,
            combinedName: `${figma.root.name}/${page.name}/${componentName}`
          })
        })

        // コンポーネントをアルファベット順にソート
        localComponents = _.orderBy(
          localComponents,
          component => component.name.toLowerCase(),
          'asc'
        )

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
    localPages = _.orderBy(localPages, page => page.name.toLowerCase(), 'asc')

    // 現在のページの情報をlocalDocumentというオブジェクトに
    const localDocument: FigmaDocument = {
      name: 'Local components',
      id: figma.root.id,
      pages: localPages,
      isCollapsed: false
    }

    // ライブラリにlocalDocumentをマージ
    this.library.push(localDocument)
    // ライブラリに現在のライブラリをマージ
    // localDocumentとライブラリの名前が同じならマージしない
    _.map(currentLibrary, library => {
      if (figma.root.name !== library.name) {
        this.library.push(library)
      }
    })

    console.log('getLibrary success', this.library)
    figma.ui.postMessage({
      type: 'getsuccess'
    } as PluginMessage)
  }

  async saveLibrary(): Promise<void> {
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
          let componentName = this.formatComponentName(component)

          // 親のtypeがCOMPONENT_SET、つまりVariantsの場合、名前を変える
          const componentParent = component.parent
          if (
            componentParent &&
            componentParent.type === ('COMPONENT_SET' as any)
          ) {
            componentName = `${componentParent.name}/${componentName}`
          }

          components.push({
            name: componentName,
            id: component.id,
            componentKey: (component as ComponentNode).key,
            pageName: page.name,
            documentName: figma.root.name,
            combinedName: `${figma.root.name}/${page.name}/${componentName}`
          })
        })

        // コンポーネントをアルファベット順にソート
        components = _.orderBy(
          components,
          component => component.name.toLowerCase(),
          'asc'
        )

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
    pages = _.orderBy(pages, page => page.name.toLowerCase(), 'asc')

    const document: FigmaDocument = {
      name: figma.root.name,
      id: figma.root.id,
      pages,
      isCollapsed: false
    }

    console.log('document', document)

    // ページが1つもない→エラーで処理中断
    if (document.pages.length === 0) {
      const msg = 'Failed to save library. No library components available.'
      figma.ui.postMessage({
        type: 'savefailed',
        data: {
          errorMessage: msg
        }
      } as PluginMessage)
      throw new Error(msg)
    }

    // 現在保存されているライブラリを取得
    let currentLibrary:
      | Library
      | undefined = await figma.clientStorage
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
    newLibrary = _.orderBy(
      newLibrary,
      library => library.name.toLowerCase(),
      'asc'
    )

    console.log('sorted newLibrary', newLibrary)

    this.library = newLibrary

    // clientStorageに更新したライブラリを保存
    await figma.clientStorage
      .setAsync(CLIENT_STORAGE_KEY_NAME, this.library)
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

    console.log('saveLibrary success', this.library)
    figma.ui.postMessage({
      type: 'savesuccess',
      data: this.library
    } as PluginMessage)
  }

  async clearLibrary(): Promise<void> {
    console.log('clearLibrary')

    this.library = []

    await figma.clientStorage
      .setAsync(CLIENT_STORAGE_KEY_NAME, this.library)
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

  updateLibrary(): void {
    console.log('updateLibrary', this.library)
    figma.ui.postMessage({
      type: 'update',
      data: this.library
    } as PluginMessage)
  }

  getIsParentInstance(node: SceneNode): boolean {
    // nodeの親がインスタンスかどうかを返す再帰関数
    // 親がpage or documentまで遡り、typeがINSTANCEならtrueを返す
    if (!node.parent) return false

    if (node.parent.type === 'INSTANCE') {
      return true
    } else if (node.parent.type === 'PAGE' || node.parent.type === 'DOCUMENT') {
      return false
    } else {
      return this.getIsParentInstance(node.parent)
    }
  }

  async createInstance(options: {
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
    if (options.key.length > 0) {
      console.log('found key')
      // チームライブラリコンポーネントの取得を試みる
      await figma
        .importComponentByKeyAsync(options.key)
        // インポートに成功
        .then(foundComponent => {
          component = foundComponent
          console.log('import component success', component)
        })
        // インポートに失敗
        .catch(err => {
          // ローカルコンポーネントの取得を試みる
          console.log('find localComponent')
          const localComponent = figma.root.findOne(node => {
            return (
              node.type === 'COMPONENT' &&
              node.name === options.name &&
              node.id === options.id
            )
          })
          // ローカルコンポーネントがある場合、そのコンポーネントを変数に入れる
          if (localComponent) {
            component = localComponent as ComponentNode
            console.log('found localComponent', component)
          }
          // ローカルコンポーネントがない場合、エラーを投げる
          else {
            const msg = 'Failed to create instance. Component not found.'
            figma.ui.postMessage({
              type: 'createinstancefailed',
              data: {
                errorMessage: msg
              }
            } as PluginMessage)
            throw new Error(msg)
          }
        })
    }
    // keyがない場合
    else {
      console.log('not found key')
      // ローカルコンポーネントの取得を試みる
      console.log('find localComponent')
      const localComponent = figma.root.findOne(node => {
        return (
          node.type === 'COMPONENT' &&
          node.name === options.name &&
          node.id === options.id
        )
      })
      // ローカルコンポーネントがある場合、そのコンポーネントを変数に入れる
      if (localComponent) {
        component = localComponent as ComponentNode
        console.log('found localComponent', component)
      }
      // ローカルコンポーネントがない場合、エラーを投げる
      else {
        const msg = 'Failed to create instance. Component not found.'
        figma.ui.postMessage({
          type: 'createinstancefailed',
          data: {
            errorMessage: msg
          }
        } as PluginMessage)
        throw new Error(msg)
      }
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

        // 選択した要素の親がインスタンスの場合
        if (this.getIsParentInstance(selection)) {
          // 現在のselectionをそのままnewSelectionに入れる
          newSelections.push(selection)

          // 選択した要素がインスタンスの場合
          // →選択した要素のmaster componentを変更する(つまり強制的にswap)
          if (selection.type === 'INSTANCE') {
            console.log('both selection and parent node is instance.')
            selection.masterComponent = component
          }
          // 選択した要素はインスタンスではない場合
          // →要素の削除や追加はできないので処理を中断
          else {
            console.log(
              'selection is child of instance, but selection is not instance'
            )
            return
          }
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

  resizeUI(height: number): void {
    let _height = height
    if (height < UI_MIN_HEIGHT) {
      _height = UI_MIN_HEIGHT
    }
    if (height > UI_MAX_HEIGHT) {
      _height = UI_MAX_HEIGHT
    }

    figma.ui.resize(UI_WIDTH, _height)
  }
}

const contoller = new Controller()

figma.showUI(__html__, { width: UI_WIDTH, height: UI_MIN_HEIGHT })

figma.ui.onmessage = async (msg: PluginMessage): Promise<void> => {
  if (msg.type === 'save') {
    await contoller.saveLibrary()
    contoller.updateLibrary()
  } else if (msg.type === 'clear') {
    await contoller.clearLibrary()
    contoller.updateLibrary()
  } else if (msg.type === 'get') {
    await contoller.getLibrary()
    contoller.updateLibrary()
  } else if (msg.type === 'createinstance') {
    await contoller.createInstance({
      key: msg.data.key,
      name: msg.data.name,
      id: msg.data.id,
      options: msg.data.options
    })
  } else if (msg.type === 'resize') {
    contoller.resizeUI(msg.data.height)
  } else if (msg.type === 'getoptions') {
    contoller.getOptions()
  } else if (msg.type === 'setoptions') {
    contoller.setOptions({
      isSwap: msg.data.isSwap,
      isOriginalSize: msg.data.isOriginalSize
    })
  }
}
