module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-recess-order'],
  plugins: ['stylelint-use-nesting'],
  rules: {
    'declaration-colon-newline-after': null,
    'no-descending-specificity': null,
    'value-list-comma-newline-after': 'always-multi-line',
    'csstools/use-nesting': 'always'
  }
}
