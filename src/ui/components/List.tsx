import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Store from '@/ui/Store'
import Util from '@/ui/Util'
import ListDocument from '@/ui/components/ListDocument'
import Options from '@/ui/components/Options'
import Search from '@/ui/components/Search'
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
    this.props.store!.updateIsHold(true)
    this.setState({ isLoading: true })
    await this.getLibrary()
    this.setState({ isLoading: false })
    this.props.store!.updateIsHold(false)
  }

  refresh(): void {
    this.props.store!.updateSearchWord('')
    this.props.store!.updateSearchResults([])
    this.props.store!.setCurrentSelectComponent({ name: '', key: '' })
  }

  async onRefreshClick(): Promise<void> {
    await this.fetch()
    this.refresh()
  }

  async componentDidMount(): Promise<void> {
    console.log('List did mount')
    await this.fetch()
    this.refresh()
    this.props.store!.resizeUI()
  }

  onSettingLinkClick(event: React.MouseEvent<HTMLAnchorElement>): void {
    event.preventDefault()
    this.props.store!.updateTabID('setting')
  }

  onSaveLinkClick(event: React.MouseEvent<HTMLAnchorElement>): void {
    event.preventDefault()
    parent.postMessage(
      {
        pluginMessage: {
          type: 'save'
        }
      } as Message,
      '*'
    )
  }

  componentDidUpdate(): void {
    // console.log('List update')
    this.props.store!.resizeUI()
  }

  componentWillUnmount(): void {
    console.log('List will unmount')
  }

  render(): JSX.Element {
    const { searchWord } = this.props.store!
    const library = this.props.store!.library as Array<FigmaDocument>
    const searchResults = this.props.store!.searchResults
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
                <p>To list team library component,</p>
                <ol>
                  <li>Open this plugin in library what you want to list.</li>
                  <li>
                    Go to{' '}
                    <a href="" onClick={this.onSettingLinkClick.bind(this)}>
                      Setting
                    </a>{' '}
                    tab in this plugin.
                  </li>
                  <li>
                    Press “
                    <a href="" onClick={this.onSaveLinkClick.bind(this)}>
                      Save or update this library data
                    </a>
                    ” button to save all components data in library to this
                    plugin.
                  </li>
                  <li>Go back to your document and open this plugin.</li>
                  <li>Enjoy!</li>
                </ol>
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

                  {searchResults.map((result, index) => {
                    return (
                      <ListComponent
                        key={index}
                        name={result.name}
                        id={result.id}
                        componentKey={result.componentKey}
                        pageName={result.pageName}
                        documentName={result.documentName}
                        combinedName={result.combinedName}
                        isLocalComponent={result.isLocalComponent}
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
                      isCollapsed={document.isCollapsed}
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

    let contentClassName = ''

    // ライブラリが空→empty表示
    if (library.length === 0) {
      contentClassName = ''
    }
    // ライブラリがあるとき
    else {
      // 検索中のとき
      if (searchWord.length > 0) {
        // searchResultsがある→検索結果を表示
        if (searchResults.length > 0) {
          contentClassName = 'has-options'
        }
        // searchResultsがない→empty表示
        else {
          contentClassName = ''
        }
      }
      // 検索中ではない→ライブラリを表示
      else {
        contentClassName = 'has-options'
      }
    }

    return (
      <div>
        <div className="searchAndRefresh">
          <Search />
          <div className="iconButton" onClick={this.onRefreshClick.bind(this)}>
            <img
              className="iconButton-icon is-refresh"
              src={require('@/ui/assets/img/icon_refresh.svg').default}
              alt=""
            />
          </div>
        </div>

        <div className={`content ${contentClassName}`}>
          <ListContent />
        </div>

        <Options />
      </div>
    )
  }
}
