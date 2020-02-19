import * as React from 'react'
import { Provider } from 'mobx-react'
import Store from '@/app/Store'
import Tab from '@/app/components/Tab'
import Main from '@/app/components/Main'

import '@/app/assets/css/style.css'

export default class App extends React.Component {
  render(): JSX.Element {
    return (
      <Provider store={new Store()}>
        <Tab />
        <Main />
      </Provider>
    )
  }
}
