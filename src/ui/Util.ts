class Util {
  public wait(ms: number): Promise<void> {
    return new Promise((resolve): void => {
      setTimeout((): void => {
        resolve()
      }, ms)
    })
  }

  public async waitFrame(frame: number): Promise<void> {
    const promiseArray: void[] = []
    let frameCount = 0

    console.log('waitFrame start')
    console.time('waitFrame time')

    function waitFunc(): Promise<void> {
      return new Promise((resolve): void => {
        requestAnimationFrame((): void => {
          frameCount++
          resolve()
        })
      })
    }

    for (let i = 0; i < frame; i++) {
      promiseArray.push(await waitFunc())
    }

    return Promise.all(promiseArray).then((): void => {
      console.log('waitFrame finish')
      console.timeEnd('waitFrame time')
      console.log('waitFrame frameCount', frameCount)
    })
  }

  public map(
    value: number,
    min1: number,
    max1: number,
    min2: number,
    max2: number
  ): number {
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1))
  }

  public mapRandom(min: number, max: number): number {
    return this.map(Math.random(), 0, 1, min, max)
  }

  public max(array: number[]): number {
    let max = Number.NEGATIVE_INFINITY
    for (let i = 0, length = array.length; i < length; i++) {
      if (max < array[i]) max = array[i]
    }
    return max
  }

  public min(array: number[]): number {
    let min = Number.POSITIVE_INFINITY
    for (let i = 0, length = array.length; i < length; i++) {
      if (min > array[i]) min = array[i]
    }
    return min
  }

  public toBoolean(str: string): boolean {
    return str.toLowerCase() === 'true'
  }
}

export default new Util()
