type TabID = 'list' | 'setting'

type MessageType =
  | 'save'
  | 'clear'
  | 'update'
  | 'get'
  | 'createinstance'
  | 'savesuccess'
  | 'clearsuccess'
  | 'getsuccess'
  | 'createinstancesuccess'
  | 'savefailed'
  | 'clearfailed'
  | 'getfailed'
  | 'createinstancefailed'

type FigmaComponent = {
  name: string
  id: string
  componentKey: string
}

type FigmaPage = {
  name: string
  id: string
  components: FigmaComponent[]
}

type FigmaDocument = {
  name: string
  id: string
  pages: FigmaPage[]
}

type Library = FigmaDocument[] | []

type PluginMessage = {
  type: MessageType
  data?: any
}

type Message = {
  pluginMessage: PluginMessage
}
