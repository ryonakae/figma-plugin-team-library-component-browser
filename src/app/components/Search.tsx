import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Store from '@/app/Store'
import _ from 'lodash'

type Props = {
  store?: Store
}
type State = {
  inputTimer: number
  inputTimerDuration: number
}

@inject('store')
@observer
export default class Search extends React.Component<Props, State> {
  private inputRef!: React.RefObject<HTMLInputElement>

  constructor(props) {
    super(props)
    this.state = {
      inputTimer: 0,
      inputTimerDuration: 500
    }
    this.inputRef = React.createRef()
  }

  onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const searchWord = event.target.value
    this.props.store!.updateSearchWord(searchWord)

    window.clearTimeout(this.state.inputTimer)
    this.setState({
      inputTimer: window.setTimeout(() => {
        this.filter(this.props.store!.searchWord)
      }, this.state.inputTimerDuration)
    })
  }

  filter(searchWord: string): void {
    console.log('excute filter', searchWord)

    const flattenLibrary = this.props.store!.flattenLibrary
    let results: FigmaComponent[] = []

    // inputに1文字も入力されていなかったら、空の結果を返して以下の処理を中断
    if (searchWord.length === 0) {
      results = []
      return this.props.store!.updateSearchResults(results)
    }

    const searchWordArray = searchWord.replace(/\s+/g, ' ').split(' ')
    console.log('searchWordArray', searchWordArray)

    let regPattern = ''
    _.map(searchWordArray, str => {
      regPattern += `(?=.*${str})`
    })
    regPattern = `^${regPattern}.*$`
    console.log('regPattern', regPattern)

    const reg = new RegExp(regPattern, 'i')
    results = _.filter(flattenLibrary, o => {
      return reg.test(o.combinedName)
    })
    console.log('search results', results)

    // ローカルコンポーネントとライブラリコンポーネントが重複する場合があるので、
    // lodashで雑にマージする
    results = _.uniqWith(results, _.isEqual)
    console.log('duplicate free results', results)

    // コンポーネントの選択を解除する
    this.props.store!.setCurrentSelectComponent({ name: '', key: '' })

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
          onChange={this.onChange.bind(this)}
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
