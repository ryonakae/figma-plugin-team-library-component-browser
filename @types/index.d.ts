type TabID = 'list' | 'setting'

type MessageType = 'save' | 'clear'

type Component = {
  name: string
  id: string
  key: string
}

type Page = {
  name: string
  id: string
  components: Component[]
}

type FigmaDocument = {
  name: string
  id: string
  pages: Page[]
}

type Library = FigmaDocument[]
