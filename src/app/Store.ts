import { observable, action } from 'mobx'
import Dialog from '@/app/components/Dialog'

export default class Store {
  constructor() {
    this.listenMessage()
  }

  private listenMessage(): void {
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
  @observable isDialogOpen = false
  @observable onDialogConfirm: (() => void) | undefined = undefined

  @action updateTabID(tabID: TabID): void {
    this.tabID = tabID
  }

  @action private updateLibrary(library: Library): void {
    this.library = library
  }

  @action openDialog(options?: {
    onDialogConfirm: Store['onDialogConfirm']
  }): void {
    this.isDialogOpen = true
    if (options && options.onDialogConfirm) {
      this.onDialogConfirm = options.onDialogConfirm
    }
  }

  @action closeDialog(): void {
    this.isDialogOpen = false
    this.onDialogConfirm = undefined
  }
}
