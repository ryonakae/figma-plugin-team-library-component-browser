import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Store from '@/app/Store'
import Util from '@/app/Util'
import ListDocument from '@/app/components/ListDocument'
import Options from '@/app/components/Options'
import Search from '@/app/components/Search'
import ListComponent from './ListComponent'

type Props = {
  store?: Store
}
type State = {
  isLoading: boolean
}

@inject('store')
@observer
export default class List extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false
    }
  }

  async getLibrary(): Promise<void> {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'get'
        }
      } as Message,
      '*'
    )

    await Util.wait(200)
  }

  async fetch(): Promise<void> {
    this.setState({ isLoading: true })
    await this.getLibrary()
    this.setState({ isLoading: false })
  }

  resize(): void {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'resize',
          data: {
            height: document.getElementById('app')!.clientHeight
          }
        }
      } as Message,
      '*'
    )
  }

  refresh(): void {
    this.props.store!.updateSearchWord('')
    this.props.store!.updateSearchResults([])
  }

  async onRefreshClick(): Promise<void> {
    await this.fetch()
    this.refresh()
  }

  async componentDidMount(): Promise<void> {
    console.log('List did mount')
    await this.fetch()
    this.refresh()
    this.resize()
  }

  componentDidUpdate(): void {
    // console.log('List update')
    this.resize()
  }

  componentWillUnmount(): void {
    console.log('List will unmount')
  }

  render(): JSX.Element {
    const { searchWord } = this.props.store!
    const library = this.props.store!.library as Array<FigmaDocument>
    const searchResults = this.props.store!.searchResults as Array<
      FigmaComponent
    >
    const isLoading = this.state.isLoading

    const ListContent: React.FC = () => {
      // ロード中ではないとき
      if (!isLoading) {
        // ライブラリが空→empty表示
        if (library.length === 0) {
          return (
            <div>
              <div className="content-title">Components</div>
              <div className="content-note">
                <p>
                  The quick brown fox jumps over the lazy dog. The quick brown
                  fox jumps over the lazy dog. The quick brown fox jumps over
                  the lazy dog. The quick brown fox jumps over the lazy dog. The
                  quick brown fox jumps over the lazy dog.
                </p>
              </div>
            </div>
          )
        }
        // ライブラリがあるとき
        else {
          // 検索中のとき
          if (searchWord.length > 0) {
            // searchResultsがある→検索結果を表示
            if (searchResults.length > 0) {
              return (
                <div>
                  <div className="content-title is-normal">
                    Showing results from all libraries
                  </div>

                  {searchResults.map((component, index) => {
                    return (
                      <ListComponent
                        key={index}
                        name={component.name}
                        id={component.id}
                        componentKey={component.componentKey}
                        parentName={component.parentName}
                      />
                    )
                  })}
                </div>
              )
            }
            // searchResultsがない→empty表示
            else {
              return (
                <div className="content-empty">
                  <span>No search results</span>
                </div>
              )
            }
          }
          // 検索中ではない→ライブラリを表示
          else {
            return (
              <div>
                {library.map((document, index) => {
                  return (
                    <ListDocument
                      key={index}
                      name={document.name}
                      id={document.id}
                      pages={document.pages}
                    />
                  )
                })}
              </div>
            )
          }
        }
      }

      // ロード中のとき
      return (
        <div className="content-loading">
          <span>Loading</span>
        </div>
      )
    }

    return (
      <div>
        <div className="searchAndRefresh">
          <Search />
          <div className="iconButton" onClick={this.onRefreshClick.bind(this)}>
            R
          </div>
        </div>

        <div className="content">
          <ListContent />
        </div>

        <Options />
      </div>
    )
  }
}
