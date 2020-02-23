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

    await Util.wait(100)
  }

  async fetch(): Promise<void> {
    this.setState({ isLoading: true })
    await this.getLibrary()
    this.setState({ isLoading: false })
  }

  async componentDidMount(): Promise<void> {
    console.log('List did mount')
    await this.fetch()
    this.props.store!.updateFilteredLibrary(this.props.store!.library)
  }

  componentWillUnmount(): void {
    console.log('List will unmount')
  }

  render(): JSX.Element {
    const { searchWord } = this.props.store!
    const library = this.props.store!.library as Array<FigmaDocument>
    const filteredLibrary = this.props.store!.filteredLibrary as Array<
      FigmaDocument
    >
    const isLoading = this.state.isLoading

    const ListContent: React.FC = () => {
      if (!isLoading) {
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
        } else if (library.length > 0 && filteredLibrary.length > 0) {
          return (
            <div>
              {searchWord.length > 0 && (
                <div className="content-title is-normal">
                  Showing results from all libraries
                </div>
              )}

              {filteredLibrary.map((document, index) => {
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
        } else if (library.length > 0 && filteredLibrary.length === 0) {
          return (
            <div className="content-empty">
              <span>No search results</span>
            </div>
          )
        }
      }

      return <div></div>
    }

    return (
      <div>
        <div className="searchAndRefresh">
          <Search />
          <div className="iconButton" onClick={this.fetch.bind(this)}>
            R
          </div>
        </div>

        <div className="list">
          <ListContent />
        </div>

        <Options />
      </div>
    )
  }
}
