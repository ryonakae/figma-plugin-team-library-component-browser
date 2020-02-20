import * as React from 'react'
import { inject, observer } from 'mobx-react'
import List from '@/app/components/List'
import Setting from '@/app/components/Setting'
import Store from '../Store'

type Props = {
  store?: Store
}
type State = {}

@inject('store')
@observer
export default class Content extends React.Component<Props, State> {
  constructor(props) {
    super(props)
  }

  render(): JSX.Element {
    return (
      <div>
        {this.props.store!.tabID === 'list' && <List />}
        {this.props.store!.tabID === 'setting' && <Setting />}
      </div>
    )
  }
}
