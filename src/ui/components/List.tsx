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

@inject('store')
@observer
export default class List extends React.Component<Props> {
  constructor(props) {
    super(props)
  }

  fetch(): void {
    this.props.store!.getLibrary()
  }

  refresh(): void {
    this.props.store!.updateSearchWord('')
    this.props.store!.updateSearchResults([])
    this.props.store!.setCurrentSelectComponent({ name: '', key: '' })
  }

  onRefreshClick(): void {
    this.fetch()
    this.refresh()
  }

  componentDidMount(): void {
    console.log('List did mount')

    // libraryが空のとき（初回起動のとき）だけfetchする
    if (this.props.store!.library.length === 0) {
      this.fetch()
    }

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
    const library = this.props.store!.library as Array<FigmaLibrary>
    const searchResults = this.props.store!.searchResults
    const isLoading = this.props.store!.isLoading

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
                        publishStatus={result.publishStatus}
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
      // ローディング中は表示しない
      if (isLoading) {
        contentClassName = ''
      }
      // 検索中のとき
      else if (searchWord.length > 0) {
        // searchResultsがある→検索結果を表示
        if (searchResults.length > 0) {
          contentClassName = 'has-options'
        }
        // searchResultsがない→empty表示
        else {
          contentClassName = ''
        }
      }
      // それ以外はライブラリを表示
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
