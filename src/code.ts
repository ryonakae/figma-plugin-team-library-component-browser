import _ from 'lodash'
import Store from '@/ui/Store'
import Util from '@/ui/Util'

const CLIENT_STORAGE_KEY_NAME = 'team-library-component-browser'
const UI_WIDTH = 300
const UI_MIN_HEIGHT = 200
const UI_MAX_HEIGHT = 500

class Controller {
  private library: Library = []
  private lastNotify: NotificationHandler | undefined = undefined

  constructor() {
    // https://www.figma.com/plugin-docs/api/properties/figma-skipinvisibleinstancechildren/
    figma.skipInvisibleInstanceChildren = true

    figma.showUI(__html__, { width: UI_WIDTH, height: UI_MIN_HEIGHT })

    figma.ui.onmessage = async (msg: PluginMessage): Promise<void> => {
      switch (msg.type) {
        case 'save':
          await this.saveLibrary()
          this.updateLibrary()
          break

        case 'clear':
          await this.clearLibrary()
          this.updateLibrary()
          break

        case 'get':
          await this.getLibrary()
          this.updateLibrary()
          break

        case 'createinstance':
          await this.createInstance({
            key: msg.data.key,
            name: msg.data.name,
            id: msg.data.id,
            options: msg.data.options
          })
          break

        case 'gotomaincomponent':
          await this.goToMainComponent({
            key: msg.data.key,
            name: msg.data.name,
            id: msg.data.id
          })
          break

        case 'resize':
          this.resizeUI(msg.data.height)
          break

        case 'getoptions':
          this.getOptions()
          break

        case 'setoptions':
          this.setOptions({
            isSwap: msg.data.isSwap,
            isOriginalSize: msg.data.isOriginalSize
          })
          break

        case 'notify':
          this.notify(msg.data.message)
          break

        default:
          break
      }
    }
  }

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

  private async setLocalComponent(
    component: ComponentNode,
    page: PageNode,
    localComponents: FigmaComponent[]
  ): Promise<void> {
    // console.log('setLocalComponent start', component.id)

    let componentName = ''
    let combinedName = ''

    // componentNameを設定
    componentName = this.formatComponentName(component)

    // コンポーネントの親を取得
    const componentParent = component.parent

    // componentNameを設定する
    // コンポーネントの親がある場合
    if (componentParent) {
      // 親のtypeがCOMPONENT_SET、つまりVariantsの場合
      if (componentParent.type === ('COMPONENT_SET' as any)) {
        // 親のさらに親（Variantsの親）がフレームかどうか
        const componentAncestor = componentParent.parent
        if (componentAncestor && componentAncestor.type === 'FRAME') {
          componentName = `${componentAncestor.name} / ${componentParent.name} / ${componentName}`
        } else {
          componentName = `${componentParent.name} / ${componentName}`
        }
      }
      // コンポーネントがVariantsでなく（普通のコンポーネント）、親がフレームの場合
      else if (componentParent.type === 'FRAME') {
        // 親の名前をcomponentNameにいい感じに加える
        componentName = `${componentParent.name} / ${componentName}`
      }
      // 親がVariantsでなく、親がフレームでもない場合は、componantNameはそのまま
      // else {}
    }

    // combinedNameを設定
    combinedName = `${figma.root.name} / ${page.name} / ${componentName}`

    localComponents.push({
      name: componentName,
      id: component.id,
      componentKey: (component as ComponentNode).key,
      pageName: page.name,
      documentName: figma.root.name,
      combinedName,
      isLocalComponent: true
    })

    // console.log('setLocalComponent finish', component.id)
  }

  private async setLocalPage(
    page: PageNode,
    localPages: FigmaPage[]
  ): Promise<void> {
    console.log('setLocalPage start', page.id)

    // const foundLocalComponents = page.findAll(node => {
    //   return node.type === 'COMPONENT'
    // })
    // https://www.figma.com/plugin-docs/api/properties/DocumentNode-findallwithcriteria/
    const foundLocalComponents = page.findAllWithCriteria({
      // types: ['COMPONENT', 'COMPONENT_SET']
      types: ['COMPONENT']
    })

    if (foundLocalComponents.length > 0) {
      console.log('found local components', foundLocalComponents)

      // localComponentという配列にコンポーネントを追加していく
      let localComponents: FigmaComponent[] = []

      // 各コンポーネントごとに処理
      await Promise.all(
        _.map(foundLocalComponents, async component => {
          await this.setLocalComponent(component, page, localComponents)
        })
      )

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

    console.log('setLocalPage finish', page.id)
  }

  async getLibrary(): Promise<void> {
    console.log('getLibrary')

    // まずライブラリを空にする
    this.library = []

    // ローカルのコンポーネント一覧を取得
    // ======================================================================
    let localPages: FigmaPage[] = []

    // ページごとにコンポーネントを探す
    await Promise.all(
      _.map(figma.root.children, async page => {
        await this.setLocalPage(page, localPages)
      })
    )

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
    // 現在のライブラリを取得
    const savedLibrary:
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
    // localDocumentとライブラリの名前が同じならマージしない
    _.map(savedLibrary, library => {
      if (figma.root.name !== library.name) {
        this.library.push(library)
      }
    })

    console.log('getLibrary success', this.library)
    figma.ui.postMessage({
      type: 'getsuccess'
    } as PluginMessage)
  }

  private async pushComponentToLibrary(
    component: ComponentNode,
    page: PageNode,
    components: FigmaComponent[]
  ): Promise<void> {
    // keyがない場合は処理をスキップ
    if (component.key.length === 0) {
      return
    }

    // コンポーネントがチームライブラリでPublishされているのかどうかを調べる
    const publishStatus = await component.getPublishStatusAsync()
    // publishされてなかったら処理をスキップ
    if (publishStatus === 'UNPUBLISHED') {
      console.log('this is unpublished component', component)
      return
    }

    let componentName = this.formatComponentName(component)

    // 親のtypeがCOMPONENT_SET、つまりVariantsの場合、名前を変える
    const componentParent = component.parent
    if (componentParent && componentParent.type === ('COMPONENT_SET' as any)) {
      componentName = `${componentParent.name}/${componentName}`
    }

    components.push({
      name: componentName,
      id: component.id,
      componentKey: (component as ComponentNode).key,
      pageName: page.name,
      documentName: figma.root.name,
      combinedName: `${figma.root.name}/${page.name}/${componentName}`,
      isLocalComponent: false
    })
  }

  private async pushPageToLibrary(
    page: PageNode,
    pages: FigmaPage[]
  ): Promise<void> {
    // ページ以下にあるコンポーネントをすべて探す
    const foundComponents = page.findAllWithCriteria({
      // types: ['COMPONENT', 'COMPONENT_SET']
      types: ['COMPONENT']
    })

    // コンポーネントが1つ以上あった場合
    if (foundComponents.length > 0) {
      console.log('found library components', foundComponents)
      let components: FigmaComponent[] = []

      // 各コンポーネントごとに処理
      await Promise.all(
        _.map(foundComponents, async component => {
          await this.pushComponentToLibrary(component, page, components)
        })
      )

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
  }

  async saveLibrary(): Promise<void> {
    console.log('saveLibrary', figma.root)

    let pages: FigmaPage[] = []

    // 各ページごとに処理
    await Promise.all(
      _.map(figma.root.children, async page => {
        await this.pushPageToLibrary(page, pages)
      })
    )

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
    let savedLibrary: Library | undefined = await figma.clientStorage
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
    console.log('savedLibrary', savedLibrary)

    // もしライブラリがすでにある場合、
    // 現在のライブラリから、documentと同じ名前のものを削除
    if (savedLibrary) {
      savedLibrary = _.remove(savedLibrary, currentDocument => {
        console.log(
          currentDocument.name,
          document.name,
          currentDocument.name === document.name
        )
        return currentDocument.name !== document.name
      })
      console.log(
        'same name documents are deleted from savedLibrary',
        savedLibrary
      )
    }

    // 現在のライブラリにdocumentをマージしたものを新しいライブラリとして返す
    let newLibrary = savedLibrary
      ? _.union(savedLibrary, [document])
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
              node.key === options.key &&
              // node.name === options.name &&
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
          node.key === options.key &&
          // node.name === options.name &&
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

        // 選択した要素がComponentsの場合
        if (selection.type === 'COMPONENT') {
          console.log('selection is component', selection)

          // インスタンスを複製
          const copiedInstance = instance.clone()

          // コンポーネントを置き換えられると困るので、ドキュメントのルートにインスタンスを追加
          // レイヤー的に上に追加していく
          figma.currentPage.insertChild(
            figma.currentPage.children.length,
            copiedInstance
          )

          // copiedInstanceをnewSelectionに入れる
          newSelections.push(copiedInstance)
        }
        // 選択した要素の親がインスタンスの場合
        else if (this.getIsParentInstance(selection)) {
          // 現在のselectionをそのままnewSelectionに入れる
          newSelections.push(selection)

          // 選択した要素がインスタンスの場合
          // →選択した要素のmaster componentを変更する(つまり強制的にswap)
          if (selection.type === 'INSTANCE') {
            console.log('both selection and parent node is instance.')
            selection.mainComponent = component
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
            // copiedInstance.rotation = selection.rotation
            // copiedInstance.layoutAlign = selection.layoutAlign
            if (
              selection.type === 'FRAME' ||
              selection.type === ('COMPONENT' as any) ||
              selection.type === 'INSTANCE' ||
              selection.type === 'RECTANGLE' ||
              selection.type === 'LINE' ||
              selection.type === 'ELLIPSE' ||
              selection.type === 'POLYGON' ||
              selection.type === 'STAR' ||
              selection.type === 'VECTOR' ||
              selection.type === 'TEXT'
            ) {
              copiedInstance.constraints = (selection as
                | FrameNode
                | ComponentNode
                | InstanceNode
                | VectorNode
                | StarNode
                | LineNode
                | EllipseNode
                | PolygonNode
                | RectangleNode
                | TextNode).constraints
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

      // ズームインもする
      // figma.viewport.scrollAndZoomIntoView(figma.currentPage.selection)
    }

    console.log('create instance success', instance)
    figma.ui.postMessage({
      type: 'createinstancesuccess'
    } as PluginMessage)
  }

  async goToMainComponent(options: {
    key: FigmaComponent['componentKey']
    name: FigmaComponent['name']
    id: FigmaComponent['id']
  }): Promise<void> {
    console.log('goToMainComponent', options)

    // メインコンポーネントの取得を試みる
    console.log('find mainComponent')
    const mainComponent = figma.root.findOne(node => {
      return (
        node.type === 'COMPONENT' &&
        node.key === options.key &&
        // node.name === options.name &&
        node.id === options.id
      )
    }) as ComponentNode | null

    // メインコンポーネントがある場合、そのコンポーネントを選択状態にして、ズームインする
    if (mainComponent) {
      console.log('found mainComponent', mainComponent)
      figma.currentPage.selection = [mainComponent]
      figma.viewport.scrollAndZoomIntoView(figma.currentPage.selection)
    }
    // メインコンポーネントがない場合、エラーを投げる
    else {
      const msg = 'Failed to go to main component. Component not found.'
      figma.ui.postMessage({
        type: 'gotomaincomponentfailed',
        data: {
          errorMessage: msg
        }
      } as PluginMessage)
      throw new Error(msg)
    }

    console.log('go to main component success', mainComponent)
    figma.ui.postMessage({
      type: 'gotomaincomponentsuccess'
    } as PluginMessage)
  }

  notify(message: string): void {
    if (this.lastNotify) {
      this.lastNotify.cancel()
    }
    this.lastNotify = figma.notify(message)
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
