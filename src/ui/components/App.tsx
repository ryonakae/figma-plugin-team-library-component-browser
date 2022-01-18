import * as React from 'react'
import { Provider } from 'mobx-react'
import Store from '@/ui/Store'
import Tab from '@/ui/components/Tab'
import Main from '@/ui/components/Main'
import Dialog from '@/ui/components/Dialog'

import '@/ui/assets/css/style.css'

export default class App extends React.Component {
  render(): JSX.Element {
    return (
      <Provider store={new Store()}>
        <Tab />
        <Main />
        <Dialog />
      </Provider>
    )
  }
}
