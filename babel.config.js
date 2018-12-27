module.exports = {
  presets: [
    '@vue/app'
  ],

  "plugins": [
    ["prismjs", { 
      "languages": ["lua", "pug"],
      // "plugins": ["line-numbers"],
      "theme": "coy",
      "css": true
    }]
  ]

}
