import * as React from 'react'
import * as mobx from 'mobx'
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
  private inputRef!: React.RefObject<HTMLInputElement>

  constructor(props) {
    super(props)
    this.state = {
      fuseOptions: {
        shouldSort: false,
        tokenize: true,
        matchAllTokens: true,
        findAllMatches: true,
        threshold: 0.0,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        // keys: [
        //   {
        //     name: 'name',
        //     weight: 0.6
        //   },
        //   {
        //     name: 'pageName',
        //     weight: 0.3
        //   },
        //   {
        //     name: 'documentName',
        //     weight: 0.1
        //   }
        // ]
        keys: ['combinedName']
      }
    }
    this.inputRef = React.createRef()
  }

  filter(event: React.ChangeEvent<HTMLInputElement>): void {
    const searchWord = event.target.value
    this.props.store!.updateSearchWord(searchWord)

    const library = this.props.store!.library as Array<FigmaDocument>
    let results: FigmaComponent[] = []

    // inputに1文字も入力されていなかったら、空の結果を返して以下の処理を中断
    if (searchWord.length === 0) {
      results = []
      return this.props.store!.updateSearchResults(results)
    }

    // ライブラリの各ドキュメントの各ページごとにfuse.searchを実行
    library.map(document => {
      document.pages.map((page, index) => {
        const fuse = new Fuse(
          mobx.toJS(page.components),
          this.state.fuseOptions
        )
        const components = fuse.search(searchWord) as FigmaComponent[]

        if (components.length > 0) {
          results = _.union(results, components)
        }
      })
    })
    console.log('fuse search', searchWord, results)

    // ローカルコンポーネントとライブラリコンポーネントが重複する場合があるので、
    // lodashで雑にマージする
    results = _.uniqWith(results, _.isEqual)
    console.log('duplicate free results', results)

    this.props.store!.updateSearchResults(results)
  }

  onClearClick(): void {
    this.props.store!.updateSearchWord('')
    this.props.store!.updateSearchResults([])
  }

  componentDidMount(): void {
    this.inputRef.current!.focus()
  }

  render(): JSX.Element {
    const { searchWord } = this.props.store!

    return (
      <div className="search">
        <img
          className="search-icon"
          src={require('@/app/assets/img/icon_search.svg').default}
          alt=""
        />
        <input
          className="search-input"
          type="text"
          placeholder="Search"
          value={searchWord}
          onChange={this.filter.bind(this)}
          ref={this.inputRef}
        />
        <div
          className={`search-clear ${
            searchWord.length > 0 ? 'is-visible' : ''
          }`}
          onClick={this.onClearClick.bind(this)}
        >
          <img
            src={require('@/app/assets/img/icon_close.svg').default}
            alt=""
          />
        </div>
      </div>
    )
  }
}
