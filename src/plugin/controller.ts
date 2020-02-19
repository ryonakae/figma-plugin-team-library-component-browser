export type MessageType = 'save'
export type Component = {
  name: string
  id: string
  key: string
}
export type Page = {
  name: string
  id: string
  components: Component[]
}
export type Document = {
  name: string
  id: string
  pages: Page[]
}
export type Library = Document[]

figma.showUI(__html__)

async function saveComponentsData(): Promise<void> {
  console.log('saveComponentsData')
  const pages: Page[] = []

  figma.root.children.forEach(page => {
    const components: Component[] = []

    page.children.forEach(scene => {
      if (scene.type === 'COMPONENT') {
        components.push({
          name: scene.name,
          id: scene.id,
          key: scene.key
        })
      }
    })

    pages.push({
      name: page.name,
      id: page.id,
      components
    })
  })

  console.log(pages)
}

figma.ui.onmessage = async (msg): Promise<void> => {
  if (msg.type === 'save') await saveComponentsData()
}
