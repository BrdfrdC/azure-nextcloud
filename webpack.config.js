const path = require('path')
// we extend the Nextcloud webpack config
const webpackConfig = require('@nextcloud/webpack-vue-config')

const buildMode = process.env.NODE_ENV
const isDev = buildMode === 'development'
webpackConfig.devtool = isDev ? 'cheap-source-map' : 'source-map'

webpackConfig.stats = {
	colors: true,
	modules: false,
}

const appId = 'azure'
webpackConfig.entry = {
	main: { import: path.join(__dirname, 'src', 'azureScript.js'), filename: appId + '-azureScript.js' },
}

module.exports = webpackConfig