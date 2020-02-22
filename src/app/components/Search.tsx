import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Store from '@/app/Store'
import Fuse from 'fuse.js'

type Props = {
  store?: Store
}
type State = {
  // fuse: Fuse<FigmaDocument, Fuse.FuseOptions<FigmaDocument>>
  fuseOptions: Fuse.FuseOptions<FigmaDocument>
}

@inject('store')
@observer
export default class Search extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    console.log(this.props.store!.library)
    console.log(this.props.store!.library.slice())
    this.state = {
      // fuse: new Fuse(this.props.store!.library.slice(), {}),
      fuseOptions: {
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['name', 'pages.name', 'pages.components.name']
      }
    }
  }

  filter(event: React.ChangeEvent<HTMLInputElement>): void {
    const value = event.target.value
    const fuse = new Fuse(
      this.props.store!.library.slice(),
      this.state.fuseOptions
    )
    const results = fuse.search(value)
    console.log(fuse, value, results)
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
