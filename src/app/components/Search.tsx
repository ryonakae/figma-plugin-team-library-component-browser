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
    const library = this.props.store!.library as Array<FigmaDocument>
    let filteredLibrary: FigmaDocument[] = []

    // inputに1文字も入力されていなかったら、libraryをそのまま表示して以下の処理を中断
    if (value.length === 0) {
      filteredLibrary = library
      return this.props.store!.updateFilteredLibrary(filteredLibrary)
    }

    // ライブラリの各ドキュメントの各ページごとにfuse.searchを実行
    library.map(document => {
      const _document: FigmaDocument = {
        name: document.name,
        id: document.id,
        pages: []
      }

      document.pages.map((page, index) => {
        const fuse = new Fuse(page.components.slice(), this.state.fuseOptions)
        const _components = fuse.search(value)
        _document.pages.push({
          name: page.name,
          id: page.id,
          components: _components as FigmaComponent[],
          parentName: _document.name
        })

        filteredLibrary = _.unionBy(filteredLibrary, [_document], 'name')
      })
    })

    console.log(filteredLibrary)
    this.props.store!.updateFilteredLibrary(filteredLibrary)
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
