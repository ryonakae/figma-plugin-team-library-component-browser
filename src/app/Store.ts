import { observable, action } from 'mobx'
import Util from '@/app/Util'
import _ from 'lodash'

export default class Store {
  constructor() {
    this.listenPluginMessage()
  }

  private listenPluginMessage(): void {
    onmessage = (msg): void => {
      const messageType: MessageType = msg.data.pluginMessage.type

      const openErrorDialog = (msg: MessageEvent): void => {
        this.openDialog({
          dialogType: 'alert',
          dialogTitle: 'An Error Occurred',
          dialogMessage: msg.data.pluginMessage.data.errorMessage
        })
      }

      switch (messageType) {
        case 'update':
          this.updateLibrary(msg.data.pluginMessage.data)
          console.log('library update', this.library)
          break

        case 'savesuccess':
          this.updateIsHold(false)
          this.notify('Success to save library data')
          break

        case 'clearsuccess':
          this.updateIsHold(false)
          this.notify('Success to clear all library data')
          break

        case 'createinstancesuccess':
          this.updateIsHold(false)
          this.notify('Success to create instance')
          // this.setCurrentSelectComponent({ name: '', key: '' })
          break

        case 'gotomaincomponentsuccess':
          this.updateIsHold(false)
          this.notify('Success to go to main component')
          // this.setCurrentSelectComponent({ name: '', key: '' })
          break

        case 'getoptionssuccess':
          this.updateOptions({
            isSwap: msg.data.pluginMessage.data.isSwap,
            isOriginalSize: msg.data.pluginMessage.data.isOriginalSize
          })
          break

        case 'savefailed':
          this.updateIsHold(false)
          openErrorDialog(msg)
          break

        case 'clearfailed':
          this.updateIsHold(false)
          openErrorDialog(msg)
          break

        case 'getfailed':
          this.updateIsHold(false)
          openErrorDialog(msg)
          break

        case 'createinstancefailed':
          this.updateIsHold(false)
          openErrorDialog(msg)
          // this.setCurrentSelectComponent({ name: '', key: '' })
          break

        case 'gotomaincomponentfailed':
          this.updateIsHold(false)
          openErrorDialog(msg)
          // this.setCurrentSelectComponent({ name: '', key: '' })
          break

        default:
          break
      }
    }
  }

  @observable tabID: TabID = 'list'
  @observable library: Library = []
  @observable flattenLibrary: FigmaComponent[] = []
  @observable searchResults: FigmaComponent[] = []
  @observable searchWord = ''

  @observable currentSelectComponentName = ''
  @observable currentSelectComponentKey = ''
  @observable isSwap = false
  @observable isOriginalSize = false

  @observable isDialogOpen = false
  @observable dialogType: 'prompt' | 'alert' = 'prompt'
  @observable dialogTitle = ''
  @observable dialogMessage?: string
  @observable dialogConfirmText?: string
  @observable dialogOnConfirm?: () => void

  @observable isSnackbarOpen = false
  @observable snackbarMessage = ''

  @observable transitionDurationMS = 150
  @observable isHold = false

  @action updateTabID(tabID: TabID): void {
    this.tabID = tabID
  }

  @action private updateLibrary(library: Library): void {
    this.library = library

    _.map(this.library, document => {
      _.map(document.pages, page => {
        _.map(page.components, component => {
          this.flattenLibrary.push(component)
        })
      })
    })

    console.log('updateLibrary on Store', this.library, this.flattenLibrary)
  }

  @action updateSearchResults(results: FigmaComponent[]): void {
    this.searchResults = results
  }

  @action updateSearchWord(word: string): void {
    this.searchWord = word
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

  @action async closeDialog(): Promise<void> {
    this.isDialogOpen = false
    await Util.wait(this.transitionDurationMS)
    this.dialogMessage = undefined
    this.dialogConfirmText = undefined
    this.dialogOnConfirm = undefined
  }

  @action notify(snackbarMessage: Store['snackbarMessage']): void {
    console.log('notify', snackbarMessage)
    this.isSnackbarOpen = true
    this.snackbarMessage = snackbarMessage

    parent.postMessage(
      {
        pluginMessage: {
          type: 'notify',
          data: {
            message: snackbarMessage
          }
        }
      } as Message,
      '*'
    )
  }

  @action toggleIsSwap(): void {
    this.isSwap = !this.isSwap
  }

  @action toggleIsOriginalSize(): void {
    this.isOriginalSize = !this.isOriginalSize
  }

  @action updateOptions(options: {
    isSwap: Store['isSwap']
    isOriginalSize: Store['isOriginalSize']
  }): void {
    console.log('updateOptions', options)
    this.isSwap = options.isSwap
    this.isOriginalSize = options.isOriginalSize
  }

  @action setCurrentSelectComponent(options: {
    name: string
    key: string
  }): void {
    console.log('setCurrentSelectComponent', options.name, options.key)
    this.currentSelectComponentName = options.name
    this.currentSelectComponentKey = options.key
  }

  @action resizeUI(): void {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'resize',
          data: {
            height: document.getElementById('app')!.clientHeight
          }
        }
      } as Message,
      '*'
    )
  }

  @action updateIsHold(bool: boolean): void {
    this.isHold = bool
  }
}
