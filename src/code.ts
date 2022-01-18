import _ from 'lodash'
import Store from '@/ui/Store'
import Util from '@/ui/Util'

const CLIENT_STORAGE_KEY_NAME = 'team-library-component-browser'
const UI_WIDTH = 300
const UI_MIN_HEIGHT = 200
const UI_MAX_HEIGHT = 500

// https://www.figma.com/plugin-docs/api/properties/figma-skipinvisibleinstancechildren/
figma.skipInvisibleInstanceChildren = true

class Code {
  private library: Library = []
  private lastNotify: NotificationHandler | undefined = undefined

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

  formatComponentName(name: string, isVariants?: boolean): string {
    let formattedName = name

    // 前後の余白をトルツメ
    // スラッシュの前後のスペースをトルツメ
    formattedName = formattedName.trim().replace(/[ 　]*\/[ 　]*/g, '/')

    // Variants対応
    if (isVariants) {
      // イコールとカンマの前後のスペースをトルツメ
      // カンマの後には半角スペース入れる
      formattedName = formattedName
        .replace(/[ 　]*,[ 　]*/g, ', ')
        .replace(/[ 　]*=[ 　]*/g, '=')

      // イコールをコロンに変換
      formattedName = formattedName.replace(/=/g, ':')

      // // 「Hoge=Fuga」を「Fuga」に整形して、カンマで区切る
      // const properties: string[] = []
      // name.split(',').map(s => {
      //   return properties.push(s.split('=')[1])
      // })
      // name = properties.join(',')
    }

    return formattedName
  }

  addFigmaVariantsOrFigmaComponentToComponents(
    component: ComponentNode | ComponentSetNode,
    options: {
      name: string
      components: (FigmaComponent | FigmaVariants)[]
      pageName: string
      combinedName: string
      isLocalComponent: boolean
      publishStatus: PublishStatus
    }
  ): void {
    // variantsを追加
    if ('defaultVariant' in component) {
      // console.log('add variants', component)

      const variantsComponents: FigmaComponent[] = []

      _.map(
        (component.children as unknown) as ComponentNode[],
        childComponent => {
          variantsComponents.push({
            name: this.formatComponentName(childComponent.name, true),
            id: childComponent.id,
            componentKey: childComponent.key,
            pageName: options.pageName,
            documentName: figma.root.name,
            combinedName: options.combinedName,
            isLocalComponent: options.isLocalComponent,
            publishStatus: options.publishStatus
          } as FigmaComponent)
        }
      )

      options.components.push({
        name: options.name,
        id: component.id,
        components: variantsComponents,
        // variantGroupProperties: component.variantGroupProperties,
        documentName: figma.root.name,
        pageName: options.pageName,
        combinedName: options.combinedName,
        isLocalComponent: options.isLocalComponent,
        publishStatus: options.publishStatus,
        isCollapsed: true
      } as FigmaVariants)
    }
    // コンポーネントを追加
    else {
      // console.log('add component', component)

      options.components.push({
        name: options.name,
        id: component.id,
        componentKey: component.key,
        pageName: options.pageName,
        documentName: figma.root.name,
        combinedName: options.combinedName,
        isLocalComponent: options.isLocalComponent,
        publishStatus: options.publishStatus
      } as FigmaComponent)
    }
  }

  async getLocalLibrary(
    libraryName: string,
    isTeamLibrary?: boolean
  ): Promise<FigmaLibrary | undefined> {
    console.log('getLocalLibrary')

    let pages: FigmaPage[] = []

    // 各ページごとに処理
    await Promise.all(
      _.map(figma.root.children, async page => {
        let components: (FigmaComponent | FigmaVariants)[] = []

        // ページ直下に置かれているコンポーネントを取得
        const immediateComponents = page.findChildren(
          node => node.type === 'COMPONENT' || node.type === 'COMPONENT_SET'
        ) as (ComponentNode | ComponentSetNode)[]

        // console.log('immediateComponents', immediateComponents)

        // 各immediateComponentsをcomponentsに追加する
        await Promise.all(
          _.map(immediateComponents, async component => {
            const name = this.formatComponentName(component.name)

            const combinedName = this.formatComponentName(
              `${figma.root.name}/${page.name}/${name}`
            )

            // isTeamLibraryがtrueの場合publish statusを取得
            let publishStatus: PublishStatus = 'UNPUBLISHED'
            if (isTeamLibrary) {
              publishStatus = await component.getPublishStatusAsync()
              // publishStatusがUNPUBLISHEDなら処理を中断
              if (publishStatus === 'UNPUBLISHED') {
                return
              }
            }

            // componentsに追加
            this.addFigmaVariantsOrFigmaComponentToComponents(component, {
              name,
              components,
              pageName: page.name,
              combinedName,
              isLocalComponent: !isTeamLibrary,
              publishStatus
            })
          })
        )

        // ページ直下にあるフレームを検索
        const foundRootFrames = page.findChildren(
          node => node.type === 'FRAME'
        ) as FrameNode[]

        // 各rootFrameごとに処理
        await Promise.all(
          _.map(foundRootFrames, async frame => {
            // rootFrame内にコンポーネントがあるか検索
            let childComponents = frame.findAllWithCriteria({
              types: ['COMPONENT', 'COMPONENT_SET']
            })

            // コンポーネントの親がVariantsのものは除外する
            // lodashだとうまくできなかったのでVanillaJSで
            childComponents = childComponents.filter(component => {
              return (
                component.parent && component.parent.type !== 'COMPONENT_SET'
              )
            })

            // 各childComponentsをcomponentsに追加する
            await Promise.all(
              _.map(childComponents, async component => {
                const name = this.formatComponentName(
                  `${frame.name}/${component.name}`
                )

                const combinedName = this.formatComponentName(
                  `${figma.root.name}/${page.name}/${frame.name}/${name}`
                )

                // isTeamLibraryがtrueの場合publish statusを取得
                let publishStatus: PublishStatus = 'UNPUBLISHED'
                if (isTeamLibrary) {
                  publishStatus = await component.getPublishStatusAsync()
                  // publishStatusがUNPUBLISHEDなら処理を中断
                  if (publishStatus === 'UNPUBLISHED') {
                    return
                  }
                }

                // componentsに追加
                this.addFigmaVariantsOrFigmaComponentToComponents(component, {
                  name,
                  components,
                  pageName: page.name,
                  combinedName,
                  isLocalComponent: !isTeamLibrary,
                  publishStatus
                })
              })
            )
          })
        )

        // componentsが空ならここで処理を中断
        if (components.length === 0) {
          return undefined
        }

        // コンポーネントをアルファベット順にソート
        components = _.orderBy(
          components,
          component => component.name.toLowerCase(),
          'asc'
        )

        // コンポーネント情報を持ったページをpages配列に追加
        pages.push({
          name: page.name,
          id: page.id,
          components,
          documentName: figma.root.name,
          isCollapsed: true
        })
      })
    )

    // コンポーネントを持ったページが0ならここで処理を中断
    const hasComponentsPages = _.filter(
      pages,
      page => page.components.length > 0
    )
    if (hasComponentsPages.length === 0) {
      console.log('getLocalLibrary aborted')
      return undefined
    }

    // ページをアルファベット順にソート
    pages = _.orderBy(pages, page => page.name.toLowerCase(), 'asc')

    // localLibraryというオブジェクトを作る
    const localLibrary: FigmaLibrary = {
      name: libraryName,
      id: figma.root.id,
      pages,
      isCollapsed: false
    }

    console.log('getLocalLibrary success', localLibrary)
    return localLibrary
  }

  async getSavedLibraries(): Promise<FigmaLibrary[] | undefined> {
    console.log('getSavedLibraries')

    const library: FigmaLibrary[] = []

    // clientStorageに保存されたlibraryを取得
    const savedLibrary:
      | Library
      | undefined = await figma.clientStorage
      .getAsync(CLIENT_STORAGE_KEY_NAME)
      .catch(err => {
        throw new Error('Failed to get library.')
      })

    // 保存されたライブラリがない場合は処理を中断
    if (!savedLibrary || (savedLibrary && savedLibrary.length === 0)) {
      console.log('getSavedLibraries aborted')
      return undefined
    }

    // savedLibraryの各ライブラリをlibraryに追加
    _.map(savedLibrary, l => {
      // ローカルライブラリと名前が同じなら追加しない
      if (figma.root.name === l.name) {
        return
      }
      library.push(l)
    })

    console.log('getSavedLibraries success')
    return library
  }

  async getLibrary(): Promise<void> {
    console.log('getLibrary')

    // まずライブラリを空にする
    this.library = []

    // ローカルのコンポーネントを取得
    const localLibrary = await this.getLocalLibrary('Local Components')

    // clientStorageに保存されたライブラリを取得
    const savedLibrary = await this.getSavedLibraries()

    // ライブラリにlocalLibraryとsavedLibraryを追加
    if (localLibrary) {
      this.library.push(localLibrary)
    }
    if (savedLibrary) {
      this.library = [...this.library, ...savedLibrary]
    }

    console.log('getLibrary success', this.library)
    figma.ui.postMessage({
      type: 'getsuccess'
    } as PluginMessage)
  }

  async saveLibrary(): Promise<void> {
    console.log('saveLibrary', figma.root)

    // ローカルライブラリを取得
    const localLibrary = await this.getLocalLibrary(figma.root.name, true)

    // ローカルライブラリにコンポーネントがない場合処理を中断
    if (!localLibrary) {
      throw new Error(
        'Failed to save library. No library components available.'
      )
    }

    // clientStorageに保存されたライブラリを取得
    let savedLibrary = await this.getSavedLibraries()

    // もしライブラリがすでにある場合、
    // 現在のライブラリから、documentと同じ名前のものを削除
    if (savedLibrary) {
      savedLibrary = _.remove(savedLibrary, currentDocument => {
        console.log(
          currentDocument.name,
          localLibrary.name,
          currentDocument.name === localLibrary.name
        )
        return currentDocument.name !== localLibrary.name
      })
      console.log(
        'same name localLibrary are deleted from savedLibrary',
        savedLibrary
      )
    }

    // 現在のライブラリにdocumentをマージしたものを新しいライブラリとして返す
    let newLibrary: FigmaLibrary[] = []
    if (savedLibrary) {
      newLibrary = [...savedLibrary, localLibrary]
    } else {
      newLibrary.push(localLibrary)
    }

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
        throw new Error('Failed to save library.')
      })

    console.log('saveLibrary success', this.library)
  }

  async saveLibraryFromUI(): Promise<void> {
    await this.saveLibrary().catch(err => {
      figma.ui.postMessage({
        type: 'savefailed',
        data: {
          errorMessage: err.message
        }
      } as PluginMessage)
      throw new Error(err)
    })

    figma.ui.postMessage({
      type: 'savesuccess',
      data: this.library
    } as PluginMessage)
  }

  async saveLibraryFromMenu(): Promise<void> {
    await this.saveLibrary().catch(err => {
      this.notify(err.message, { error: true })
      figma.closePlugin()
      throw new Error(err)
    })
    this.notify('Success to save library data')
    figma.closePlugin()
  }

  async clearLibrary(): Promise<void> {
    console.log('clearLibrary')

    this.library = []

    await figma.clientStorage
      .setAsync(CLIENT_STORAGE_KEY_NAME, this.library)
      .catch(err => {
        throw new Error('Failed to clear library.')
      })

    console.log('clearLibrary success')
  }

  async clearLibraryFromUI(): Promise<void> {
    await this.clearLibrary().catch(err => {
      figma.ui.postMessage({
        type: 'clearfailed',
        data: {
          errorMessage: 'Failed to clear library.'
        }
      } as PluginMessage)
      throw new Error(err)
    })

    figma.ui.postMessage({
      type: 'clearsuccess'
    } as PluginMessage)
  }

  async clearLibraryFromMenu(): Promise<void> {
    await this.clearLibrary().catch(err => {
      this.notify(err.message, { error: true })
      figma.closePlugin()
      throw new Error(err)
    })
    this.notify('Success to clear all library data')
    figma.closePlugin()
  }

  updateLibrary(): void {
    console.log('updateLibrary', this.library)
    figma.ui.postMessage({
      type: 'update',
      data: this.library
    } as PluginMessage)
  }

  async getTeamLibraryComponent(
    options: CreateInstanceOptions
  ): Promise<ComponentNode> {
    const component = await figma
      .importComponentByKeyAsync(options.key)
      .catch(err => {
        throw new Error('Team library component import failed.')
      })
    return component
  }

  async getLocalComponent(
    options: CreateInstanceOptions
  ): Promise<ComponentNode> {
    const component = figma.root.findOne(node => {
      return (
        node.type === 'COMPONENT' &&
        node.key === options.key &&
        // node.name === options.name &&
        node.id === options.id
      )
    }) as ComponentNode | null
    if (!component) {
      throw new Error('Local component not found.')
    } else {
      return component
    }
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

  async createInstance(options: CreateInstanceOptions): Promise<void> {
    console.log('createInstance', options)

    let component!: ComponentNode

    // コンポーネントを取得する
    if (options.key.length > 0) {
      // keyがある場合
      console.log('found key')

      // チームライブラリコンポーネントの取得を試みる
      // 普通に取得できたらそのままComponentNodeを返す
      // 取得に失敗したらローカルコンポーネントを取得し、そのComponentNodeを返す
      // ローカルコンポーネントも無かったら、undefinedを返す
      const teamLibraryComponent = await this.getTeamLibraryComponent(
        options
      ).catch(async err => {
        const localComponent = await this.getLocalComponent(options).catch(
          err => {
            return undefined
          }
        )
        return localComponent
      })

      if (teamLibraryComponent) {
        component = teamLibraryComponent
      } else {
        const msg = 'Failed to create instance. Component not found.'
        figma.ui.postMessage({
          type: 'createinstancefailed',
          data: {
            errorMessage: msg
          }
        } as PluginMessage)
        throw new Error(msg)
      }
    } else {
      // keyがない場合
      console.log('not found key')

      // ローカルコンポーネントの取得を試みる
      const localComponent = await this.getLocalComponent(options).catch(
        err => {
          return undefined
        }
      )

      if (localComponent) {
        component = localComponent
        console.log('found localComponent', component)
      } else {
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

    // get selections
    const selections = figma.currentPage.selection
    console.log('selections', selections)

    // isSwapがfalseで何も選択していない場合
    if (!options.options.isSwap && selections.length === 0) {
      // ページのルートにインスタンスを追加
      console.log('isSwap is false, so instance is inserted to root')

      const instance = component.createInstance()

      // 現在のselectionをインスタンスにする
      figma.currentPage.selection = [instance]
    }
    // isSwapがfalseだが1つ以上選択している場合
    else if (!options.options.isSwap && selections.length > 0) {
      console.log('isSwap is false, but some selections.')
      console.log(selections)

      const instance = component.createInstance()

      // 1つだけ選択しているとき→その要素の上にインスタンスを追加
      if (selections.length === 1) {
        const selection = selections[0]
        const selectionsParent = selection.parent
        // selectionsParentが無い場合は処理中断
        if (!selectionsParent) {
          return
        }
        // 選択した要素のインデックスを取得
        const index = _.findIndex(
          selectionsParent.children,
          (child): boolean => {
            return child.id === selection.id
          }
        )
        // 取得したインデックスを元に、選択した要素の後にインスタンスを移動
        // ※配列的には後、Figmaの表示では上
        selectionsParent.insertChild(index + 1, instance)
      }
      // 1つ以上選択しているとき→場合分けが膨大すぎるのでページのルートに挿入
      else {
        // なにもしない
      }

      // 現在のselectionをインスタンスにする
      figma.currentPage.selection = [instance]
    }
    // isSwapがtrueだが何も選択してない場合
    else if (options.options.isSwap && selections.length === 0) {
      // ドキュメントのルートにインスタンスを追加
      console.log('isSwap is false, so instance is inserted to document root')

      const instance = component.createInstance()

      // 現在のselectionをインスタンスにする
      figma.currentPage.selection = [instance]
    }
    // isSwapがtrueで、1つ以上選択している場合→selectionごとに処理を実行
    else {
      const newSelections: SceneNode[] = []

      _.map(selections, selection => {
        console.log('selection', selection)

        // 選択した要素の親を取得
        const parent = selection.parent
        console.log('parent', parent)

        // 親がない→処理を中断
        if (!parent) return

        // 選択した要素がComponentsもしくはVariantsの場合
        if (
          selection.type === 'COMPONENT' ||
          selection.type === 'COMPONENT_SET'
        ) {
          // コンポーネントを置き換えられると困るので、ドキュメントのルートにインスタンスを追加
          // レイヤー的に上に追加していく
          const instance = component.createInstance()
          figma.currentPage.insertChild(
            figma.currentPage.children.length,
            instance
          )
          newSelections.push(instance)
        }
        // 選択した要素の親がインスタンスの場合
        else if (this.getIsParentInstance(selection)) {
          console.log('selection parent is instance')

          // 選択した要素がインスタンスの場合→swap
          if (selection.type === 'INSTANCE') {
            console.log('selection is instance')
            selection.swapComponent(component)
          }
          // インスタンスではない場合
          else {
            // 要素の削除や追加はできないのでエラーで処理中断
            console.log('selection is child of instance, but not instance')
            const msg =
              'Failed to create instance. Selection is child of instance, but not instance.'
            figma.ui.postMessage({
              type: 'createinstancefailed',
              data: {
                errorMessage: msg
              }
            } as PluginMessage)
            throw new Error(msg)
          }

          newSelections.push(selection)
        }
        // 選択した要素がインスタンスの場合
        else if (selection.type === 'INSTANCE') {
          console.log('selection is instance')

          const selectionWidth = selection.width
          const selectionHeight = selection.height

          // swapする
          selection.swapComponent(component)

          // isOriginalSizeがfalse→selectionのサイズをswap後のインスタンスにも適用
          if (!options.options.isOriginalSize) {
            selection.resize(selectionWidth, selectionHeight)
          }

          newSelections.push(selection)
        }
        // それ以外の場合
        else {
          const instance = component.createInstance()

          // 選択した要素のインデックスを取得
          const index = _.findIndex(parent.children, (child): boolean => {
            return child.id === selection.id
          })
          console.log('index', index)

          // 取得したインデックスを元に、選択した要素の後にインスタンスを移動
          // ※配列的には後、Figmaの表示では上
          parent.insertChild(index + 1, instance)

          // isOriginalSizeがfalse→selectionのサイズをインスタンスのサイズにする
          if (!options.options.isOriginalSize) {
            console.log('resize copied instance')
            instance.resize(selection.width, selection.height)
          }

          // instanceの色んなプロパティを選択した要素と同じにする
          // Scene node properties
          instance.visible = selection.visible
          instance.locked = selection.locked
          // // Frame properties
          // if (
          //   selection.type === 'GROUP' ||
          //   selection.type === 'FRAME' ||
          //   selection.type === 'COMPONENT' ||
          //   selection.type === 'INSTANCE'
          // ) {
          //   instance.clipsContent = selection.clipsContent
          //   instance.guides = selection.guides
          //   instance.layoutGrids = selection.layoutGrids
          //   instance.gridStyleId = selection.gridStyleId
          // }
          // if (
          //   selection.type === 'FRAME' ||
          //   selection.type === 'COMPONENT' ||
          //   selection.type === 'INSTANCE'
          // ) {
          //   instance.layoutMode = selection.layoutMode
          //   instance.counterAxisSizingMode =
          //     selection.counterAxisSizingMode
          //   instance.horizontalPadding = selection.horizontalPadding
          //   instance.verticalPadding = selection.verticalPadding
          //   instance.itemSpacing = selection.itemSpacing
          // }
          // // Container-related properties
          // if (
          //   selection.type === 'GROUP' ||
          //   selection.type === 'FRAME' ||
          //   selection.type === 'COMPONENT' ||
          //   selection.type === 'INSTANCE'
          // ) {
          //   instance.backgrounds = selection.backgrounds
          //   instance.backgroundStyleId = selection.backgroundStyleId
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
          //   instance.fills = selection.fills
          //   instance.strokes = selection.strokes
          //   instance.strokeWeight = selection.strokeWeight
          //   // instance.strokeMiterLimit = selection.strokeMiterLimit
          //   instance.strokeAlign = selection.strokeAlign
          //   instance.strokeCap = selection.strokeCap
          //   instance.strokeJoin = selection.strokeJoin
          //   instance.dashPattern = selection.dashPattern
          //   instance.fillStyleId = selection.fillStyleId
          //   instance.strokeStyleId = selection.strokeStyleId
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
          //   instance.cornerRadius = selection.cornerRadius
          //   instance.cornerSmoothing = selection.cornerSmoothing
          // }
          // if (
          //   selection.type === 'FRAME' ||
          //   selection.type === 'COMPONENT' ||
          //   selection.type === 'INSTANCE' ||
          //   selection.type === 'RECTANGLE'
          // ) {
          //   instance.topLeftRadius = selection.topLeftRadius
          //   instance.topRightRadius = selection.topRightRadius
          //   instance.bottomLeftRadius = selection.bottomLeftRadius
          //   instance.bottomRightRadius = selection.bottomRightRadius
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
          //   instance.opacity = selection.opacity
          //   instance.blendMode = selection.blendMode
          //   instance.isMask = selection.isMask
          //   instance.effects = selection.effects
          //   instance.effectStyleId = selection.effectStyleId
          // }
          // Layout-related properties
          instance.relativeTransform = selection.relativeTransform
          instance.x = selection.x
          instance.y = selection.y
          // instance.rotation = selection.rotation
          // instance.layoutAlign = selection.layoutAlign
          if (
            selection.type === 'FRAME' ||
            selection.type === ('COMPONENT' as any) ||
            // selection.type === 'INSTANCE' ||
            selection.type === 'RECTANGLE' ||
            selection.type === 'LINE' ||
            selection.type === 'ELLIPSE' ||
            selection.type === 'POLYGON' ||
            selection.type === 'STAR' ||
            selection.type === 'VECTOR' ||
            selection.type === 'TEXT'
          ) {
            instance.constraints = (selection as
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
          instance.exportSettings = selection.exportSettings

          // selectionを削除
          selection.remove()

          newSelections.push(instance)
        }
      })

      // 現在のselectionをnewSelectionsにする
      figma.currentPage.selection = newSelections

      // ズームインもする
      // figma.viewport.scrollAndZoomIntoView(figma.currentPage.selection)
    }

    console.log('create instance success')
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

  notify(message: string, options?: NotificationOptions): void {
    if (this.lastNotify) {
      this.lastNotify.cancel()
    }
    this.lastNotify = figma.notify(message, options)
  }

  openUI(): void {
    figma.ui.onmessage = async (msg: PluginMessage): Promise<void> => {
      switch (msg.type) {
        case 'save':
          await this.saveLibraryFromUI()
          this.updateLibrary()
          break

        case 'clear':
          await this.clearLibraryFromUI()
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

    figma.showUI(__html__, { width: UI_WIDTH, height: UI_MIN_HEIGHT })
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

const code = new Code()

if (figma.command === 'open') {
  code.openUI()
} else if (figma.command === 'save') {
  code.saveLibraryFromMenu()
} else if (figma.command === 'clear') {
  code.clearLibraryFromMenu()
}
