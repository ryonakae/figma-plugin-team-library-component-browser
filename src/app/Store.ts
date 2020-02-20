import { observable, action } from 'mobx'

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
      } else if (messageType === 'savesuccess') {
        this.openSnackbar('Success to save library data')
      } else if (messageType === 'clearsuccess') {
        this.openSnackbar('Success to clear all library data')
      }
    }
  }

  @observable tabID: TabID = 'list'
  @observable library: Library = []

  @observable currentSelectComponent: FigmaComponent | null = null

  @observable isDialogOpen = false
  @observable dialogType: 'prompt' | 'alert' = 'prompt'
  @observable dialogTitle = ''
  @observable dialogMessage?: string
  @observable dialogConfirmText?: string
  @observable dialogOnConfirm?: () => void

  @observable isSnackbarOpen = false
  @observable snackbarMessage = ''

  @action updateTabID(tabID: TabID): void {
    this.tabID = tabID
  }

  @action private updateLibrary(library: Library): void {
    this.library = library
  }

  @action openDialog(options?: {
    dialogType: Store['dialogType']
    dialogTitle: Store['dialogTitle']
    dialogMessage?: Store['dialogMessage']
    dialogConfirmText?: Store['dialogConfirmText']
    dialogOnConfirm?: Store['dialogOnConfirm']
  }): void {
    this.isDialogOpen = true

    if (options) {
      this.dialogType = options.dialogType
      this.dialogTitle = options.dialogTitle

      if (options.dialogMessage) {
        this.dialogMessage = options.dialogMessage
      }

      if (options.dialogConfirmText) {
        this.dialogConfirmText = options.dialogConfirmText
      }

      if (options.dialogOnConfirm) {
        this.dialogOnConfirm = options.dialogOnConfirm
      }
    }
  }

  @action closeDialog(): void {
    this.isDialogOpen = false

    this.dialogMessage = undefined
    this.dialogConfirmText = undefined
    this.dialogOnConfirm = undefined
  }

  @action openSnackbar(snackbarMessage: Store['snackbarMessage']): void {
    console.log('openSnackbar')
    this.isSnackbarOpen = true
    this.snackbarMessage = snackbarMessage
  }

  @action closeSnackbar(): void {
    console.log('closeSnackbar', this.isSnackbarOpen)
    this.isSnackbarOpen = false
    this.snackbarMessage = ''
  }
}
