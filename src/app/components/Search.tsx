import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Store from '@/app/Store'
import Fuse from 'fuse.js'
import _ from 'lodash'

type Props = {
  store?: Store
}
type State = {
  fuseOptions: Fuse.FuseOptions<FigmaComponent>
}

@inject('store')
@observer
export default class Search extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
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
    const searchWord = event.target.value
    this.props.store!.updateSearchWord(searchWord)

    const library = this.props.store!.library as Array<FigmaDocument>
    let filteredLibrary: FigmaDocument[] = []

    // inputに1文字も入力されていなかったら、libraryをそのまま表示して以下の処理を中断
    if (searchWord.length === 0) {
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
      let componentCount = 0

      document.pages.map((page, index) => {
        const fuse = new Fuse(page.components.slice(), this.state.fuseOptions)
        const _components = fuse.search(searchWord) as FigmaComponent[]
        console.log('fuse.search', searchWord)

        _document.pages.push({
          name: page.name,
          id: page.id,
          components: _components,
          parentName: _document.name
        })

        componentCount += _components.length
      })

      if (componentCount > 0) {
        filteredLibrary = _.unionBy(filteredLibrary, [_document], 'name')
      }
    })

    this.props.store!.updateFilteredLibrary(filteredLibrary)
  }

  onClearClick(): void {
    this.props.store!.updateSearchWord('')
    this.props.store!.updateFilteredLibrary(this.props.store!.library)
  }

  render(): JSX.Element {
    const { searchWord } = this.props.store!

    return (
      <div className="search">
        <span className="search-icon">S</span>
        <input
          className="search-input"
          type="text"
          placeholder="Search"
          value={searchWord}
          onChange={this.filter.bind(this)}
        />
        <div
          className={`search-clear ${
            searchWord.length > 0 ? 'is-visible' : ''
          }`}
          onClick={this.onClearClick.bind(this)}
        >
          <span className="icon">X</span>
        </div>
      </div>
    )
  }
}
