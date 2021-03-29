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

type FigmaComponent = {
  name: string
  id: string
  componentKey: string
  documentName: string
  pageName: string
  combinedName: string
  isLocalComponent: boolean
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

type Library = FigmaDocument[]

type PluginMessage = {
  type: MessageType
  data?: any
}

type Message = {
  pluginMessage: PluginMessage
}
