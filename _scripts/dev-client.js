const hotClient = require('webpack-hot-middleware/client?noInfo=true&reload=true')

hotClient.subscribe((event) => {
  /**
   * Reload browser when HTMLWebpackPlugin emits a new index.html
   */
  if (event.action === 'reload') {
    window.location.reload()
  }
})
