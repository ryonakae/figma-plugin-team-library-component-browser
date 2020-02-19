import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { StoreType } from '@/app/store'
import List from '@/app/components/List'
import Setting from '@/app/components/Setting'

type MyProps = {
  store?: StoreType
}
type MyState = {}

@inject('store')
@observer
export default class Content extends React.Component<MyProps, MyState> {
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
