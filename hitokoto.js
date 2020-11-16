// iOS14一言插件
class Hitokoto {
  /**
   * 渲染组件
   */
  async render() {
    let widget = new ListWidget()
    // widget = await this.renderHeader(widget, '一言')
    let data = await this.getData()
    // 主体内容文字
    let content = widget.addText(data['hitokoto'])
    content.font = Font.lightSystemFont(14)
    widget.addSpacer(10)
    let footer = widget.addText("—— " + data['from'])
    footer.font = Font.lightSystemFont(10)
    footer.textOpacity = 0.5
    footer.rightAlignText()
    // 添加渐变色背景
    // let gradient = new LinearGradient()
    // gradient.locations = [0, 1]
    // gradient.colors = [new Color("#DEDEDE"), new Color("#E2E2E2")]
    // widget.backgroundGradient = gradient
    return widget
  }

  /**
   * 渲染标题
   * @param widget 组件对象
   * @param title 标题
   */
  async renderHeader(widget, title) {
    let header = widget.addStack()
    header.centerAlignContent()
    header.addSpacer(10)
    let _title = header.addText(title)
    _title.textOpacity = 0.7
    _title.font = Font.boldSystemFont(12)
    widget.addSpacer(15)
    return widget
  }

  async getData() {
    let api = `https://v1.hitokoto.cn/`
    return await this.fetchAPI(api)
  }

  async fetchAPI(api, json = true) {
    let data = null
    const cacheKey = `${this.fileName}_cache`
    try {
      let req = new Request(api)
      data = await (json ? req.loadJSON() : req.loadString())
    } catch (e) { }
    // 判断数据是否为空（加载失败）
    if (!data) {
      // 判断是否有缓存
      if (Keychain.contains(cacheKey)) {
        let cache = Keychain.get(cacheKey)
        return json ? JSON.parse(cache) : cache
      } else {
        // 刷新
        return null
      }
    }
    // 存储缓存
    Keychain.set(cacheKey, json ? JSON.stringify(data) : data)
    return data
  }

  /**
   * 组件单独在桌面运行时调用
   */
  async init() {
    let widgetRender = await this.render()
    Script.setWidget(widgetRender)
    Script.complete()
  }
}

await new Hitokoto().init()
