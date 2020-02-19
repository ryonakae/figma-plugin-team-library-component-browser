import * as React from 'react'
import '@/app/assets/css/style.css'
import Tab from '@/app/components/Tab'
import List from '@/app/components/List'
import Setting from '@/app/components/Setting'
import { Provider } from 'mobx-react'
import Store from '@/app/Store'

export default class App extends React.Component {
  render(): JSX.Element {
    return (
      <Provider store={new Store()}>
        <Tab />
        <List />
        <Setting />
      </Provider>
    )
  }
}
