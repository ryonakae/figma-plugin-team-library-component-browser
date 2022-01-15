module.exports = {
  plugins: {
    'postcss-import': {
      path: 'src/ui/assets/css'
    },
    'postcss-preset-env': {
      stage: 2,
      features: {
        'nesting-rules': true
      },
      importFrom: ['src/ui/assets/css/custom-properties.css']
    },
    cssnano:
      process.env.NODE_ENV === 'production'
        ? {
            preset: 'default',
            autoprefixer: false,
            zindex: false,
            discardUnused: {
              fontFace: false
            }
          }
        : false
  }
}
