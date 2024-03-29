type TabID = 'list' | 'setting'

type MessageType =
  | 'get'
  | 'getsuccess'
  | 'getfailed'
  | 'save'
  | 'savesuccess'
  | 'savefailed'
  | 'clear'
  | 'clearsuccess'
  | 'clearfailed'
  | 'getoptions'
  | 'getoptionssuccess'
  | 'setoptions'
  | 'setoptionssuccess'
  | 'createinstance'
  | 'createinstancesuccess'
  | 'createinstancefailed'
  | 'gotomaincomponent'
  | 'gotomaincomponentsuccess'
  | 'gotomaincomponentfailed'
  | 'update'
  | 'resize'
  | 'notify'

type FigmaComponent = {
  name: string
  id: string
  componentKey: string
  documentName: string
  pageName: string
  combinedName: string
  isLocalComponent: boolean
  publishStatus: PublishStatus
}

type FigmaVariants = {
  name: string
  id: string
  components: FigmaComponent[]
  // defaultVariant: ComponentNode
  // variantGroupProperties: { [property: string]: { values: string[] } }
  documentName: string
  pageName: string
  combinedName: string
  isLocalComponent: boolean
  publishStatus: PublishStatus
  isCollapsed: boolean
}

type FigmaPage = {
  name: string
  id: string
  components: (FigmaComponent | FigmaVariants)[]
  documentName: string
  isCollapsed: boolean
}

type FigmaLibrary = {
  name: string
  id: string
  pages: FigmaPage[]
  isCollapsed: boolean
}

type Library = FigmaLibrary[]

type PluginMessage = {
  type: MessageType
  data?: any
}

type Message = {
  pluginMessage: PluginMessage
}

type NodeTypes =
  | 'BOOLEAN_OPERATION'
  | 'CODE_BLOCK'
  | 'COMPONENT'
  | 'COMPONENT_SET'
  | 'CONNECTOR'
  | 'DOCUMENT'
  | 'ELLIPSE'
  | 'EMBED'
  | 'FRAME'
  | 'GROUP'
  | 'INSTANCE'
  | 'LINE'
  | 'LINK_UNFURL'
  | 'PAGE'
  | 'POLYGON'
  | 'RECTANGLE'
  | 'SHAPE_WITH_TEXT'
  | 'SLICE'
  | 'STAMP'
  | 'STAR'
  | 'STICKY'
  | 'TEXT'
  | 'VECTOR'
  | 'WIDGET'

type CreateInstanceOptions = {
  key: FigmaComponent['componentKey']
  name: FigmaComponent['name']
  id: FigmaComponent['id']
  options: {
    isSwap: boolean
    isOriginalSize: boolean
  }
}
