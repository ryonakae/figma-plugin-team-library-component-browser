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
  fuseOptions: Fuse.IFuseOptions<FigmaComponent>
}

@inject('store')
@observer
export default class Search extends React.Component<Props, State> {
  private inputRef!: React.RefObject<HTMLInputElement>

  constructor(props) {
    super(props)
    this.state = {
      fuseOptions: {
        isCaseSensitive: false,
        includeScore: false,
        includeMatches: false,
        minMatchCharLength: 1,
        shouldSort: true,
        findAllMatches: false,
        // location: 0,
        threshold: 0.5,
        // distance: 100,
        ignoreLocation: true,
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
    console.log('excute filter', searchWord)

    const flattenLibrary = this.props.store!.flattenLibrary
    let results: Fuse.FuseResult<FigmaComponent>[] = []

    // inputに1文字も入力されていなかったら、空の結果を返して以下の処理を中断
    if (searchWord.length === 0) {
      results = []
      return this.props.store!.updateSearchResults(results)
    }

    const fuse = new Fuse(flattenLibrary, this.state.fuseOptions)
    const fuseResult = fuse.search(searchWord)
    console.log('fuseResult', fuseResult)
    if (fuseResult.length > 0) {
      results = fuseResult
    }

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
