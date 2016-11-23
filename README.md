<h1>NESS (测试阶段，请勿使用于实际项目)</h1>
> 在微信小程序中使用cssnext

![alt tag](http://i.imgur.com/XkvxMWx.gif)


<h3>为何使用cssnext而不用scss, less?</h3> 
- 类似于babel, cssnext也是一款转译器, 根据目前仍处于草案阶段、未被浏览器实现的标准把代码转译成符合目前浏览器实现的 CSS。
支持大部分sass、less等特性，例如css变量, mixin等，优点在于以后浏览器全面支持后，可以直接去掉cssnext，而不用改变任何代码。

<h2>Usage</h2>
必要安装:
```
$ npm install postcss-cli ness-tool postcss -g
```

按需安装:
```
//按需安装相关postcss插件
//例如需要custom-properties特性的就安装此插件
//详细特性列表: http://cssnext.io/features/
$ npm install plugins -g
```

terminal前往至微信小程序项目的根目录, 使用: 
```
//首次运行需要设置plugin, 请带参数, 如: ness -u xxx 或 ness --use xxx, 如:
$ ness -u postcss-import -u postcss-discard-comments -u postcss-custom-properties
```

详细参数:
``` 
ness [--use|-u] plugin
  -u, --use           postcss 插件名称 (可以多个插件一起使用)
  -v, --version       显示版本
  -h, --help          显示帮助
```

todo:
- 增加 options 配置参数