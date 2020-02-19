import { observable, action } from 'mobx'

export default class Store {
  constructor() {
    onmessage = (msg): void => {
      const messageType: MessageType = msg.data.pluginMessage.type

      if (messageType === 'update') {
        this.updateLibrary(msg.data.pluginMessage.data)
        console.log('library update', this.library)
      }
    }
  }

  @observable tabID: TabID = 'list'

  @observable library: Library = []

  @action updateTabID(tabID: TabID): void {
    this.tabID = tabID
  }

  @action private updateLibrary(library: Library): void {
    this.library = library
  }
}
