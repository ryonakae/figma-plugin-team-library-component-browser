type TabID = 'list' | 'setting'

type MessageType = 'save' | 'clear' | 'update' | 'get'

type FigmaComponent = {
  name: string
  id: string
  key: string
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

type StoreType = {
  tabID: TabID
  library: Library
  updateTabID: (tabID: TabID) => void
}
