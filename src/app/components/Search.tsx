import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Store from '@/app/Store'
import Fuse from 'fuse.js'
import _ from 'lodash'

type Props = {
  store?: Store
}
type State = {
  // fuse: Fuse<FigmaDocument, Fuse.FuseOptions<FigmaDocument>>
  fuseOptions: Fuse.FuseOptions<FigmaComponent>
}

@inject('store')
@observer
export default class Search extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      // fuse: new Fuse(this.props.store!.library.slice(), {}),
      fuseOptions: {
        threshold: 0.1,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['name', 'parentName']
      }
    }
  }

  filter(event: React.ChangeEvent<HTMLInputElement>): void {
    const value = event.target.value
    let results: Fuse.FuseResultWithMatches<FigmaComponent>[] = []

    // ライブラリの各ドキュメントの各ページごとにfuse.searchを実行
    const library = this.props.store!.library as Array<FigmaDocument>
    library.map(document => {
      document.pages.map(page => {
        const fuse = new Fuse(page.components.slice(), this.state.fuseOptions)
        const result = fuse.search(value) as any
        if (result.length > 0) {
          results = _.concat(results, result)
        }
      })
    })

    console.log(results)
    this.props.store!.updateFilteredLibrary(results)

    console.log(
      this.props.store!.filteredLibrary.map(component => {
        return component['name']
      })
    )
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
