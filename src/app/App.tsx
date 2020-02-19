import * as React from 'react'
import '@/app/assets/css/style.css'
import Tab from '@/app/components/Tab'
import List from '~/app/components/List'
import Setting from '~/app/components/Setting'

export default class App extends React.Component {
  render(): JSX.Element {
    return (
      <div>
        <Tab />
        <List />
        <Setting />
      </div>
    )
  }
}
