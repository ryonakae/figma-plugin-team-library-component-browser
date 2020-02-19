import { observable, action } from 'mobx'

type TabID = 'list' | 'setting'

export type StoreType = {
  tabID: TabID
  updateTabID: (tabID: TabID) => void
}

export default class Store {
  @observable tabID: TabID = 'list'

  @action updateTabID(tabID: TabID): void {
    this.tabID = tabID
  }
}
