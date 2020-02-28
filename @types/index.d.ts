type TabID = 'list' | 'setting'

type MessageType =
  | 'save'
  | 'clear'
  | 'update'
  | 'get'
  | 'createinstance'
  | 'resize'
  | 'getoptions'
  | 'setoptions'
  | 'savesuccess'
  | 'clearsuccess'
  | 'getsuccess'
  | 'createinstancesuccess'
  | 'getoptionssuccess'
  | 'setoptionssuccess'
  | 'savefailed'
  | 'clearfailed'
  | 'getfailed'
  | 'createinstancefailed'

type FigmaComponent = {
  name: string
  id: string
  componentKey: string
  documentName: string
  pageName: string
  combinedName: string
}

type FigmaPage = {
  name: string
  id: string
  components: FigmaComponent[]
  documentName: string
  isCollapsed: boolean
}

type FigmaDocument = {
  name: string
  id: string
  pages: FigmaPage[]
  isCollapsed: boolean
}

type Library = FigmaDocument[] | []

type PluginMessage = {
  type: MessageType
  data?: any
}

type Message = {
  pluginMessage: PluginMessage
}
