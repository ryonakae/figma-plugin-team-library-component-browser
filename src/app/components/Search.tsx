import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Store from '@/app/Store'
import Fuse from 'fuse.js'

type Props = {
  store?: Store
}
type State = {
  fuse: Fuse<FigmaDocument, Fuse.FuseOptions<FigmaDocument>>
  fuseOptions: Fuse.FuseOptions<FigmaDocument>
}

@inject('store')
@observer
export default class Search extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      fuse: new Fuse(this.props.store!.library.slice(), {}),
      fuseOptions: {
        keys: ['name', 'pages.name', 'pages.components.name']
      }
    }
  }

  filter(event: React.ChangeEvent<HTMLInputElement>): void {
    const value = event.target.value
    const results = this.state.fuse.search(value)
    console.log(results)
  }

  render(): JSX.Element {
    const { library } = this.props.store!

    return (
      <div>
        <input
          type="text"
          placeholder="Search"
          onChange={this.filter.bind(this)}
        />
      </div>
    )
  }
}
