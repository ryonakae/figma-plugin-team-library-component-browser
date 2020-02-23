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
    const library = this.props.store!.library as Array<FigmaDocument>
    const filteredLibrary = this.props.store!.filteredLibrary as Array<
      FigmaDocument
    >
    const isLoading = this.state.isLoading

    return (
      <div>
        <div className="searchAndRefresh">
          <Search />
          <div className="iconButton" onClick={this.fetch.bind(this)}>
            R
          </div>
        </div>

        <div className="list">
          {/* {isLoading && <div>Loading</div>} */}

          {!isLoading &&
            filteredLibrary.length > 0 &&
            filteredLibrary.map((document, index) => {
              return (
                <ListDocument
                  key={index}
                  name={document.name}
                  id={document.id}
                  pages={document.pages}
                />
              )
            })}

          {!isLoading && filteredLibrary.length === 0 && (
            <div>No search results</div>
          )}

          {!isLoading && library.length === 0 && (
            <div className="list-noComponent">
              <div className="list-title">Components</div>
              <div className="list-note">
                The quick brown fox jumps over the lazy dog. The quick brown fox
                jumps over the lazy dog. The quick brown fox jumps over the lazy
                dog. The quick brown fox jumps over the lazy dog. The quick
                brown fox jumps over the lazy dog.
              </div>
            </div>
          )}
        </div>

        <Options />
      </div>
    )
  }
}
