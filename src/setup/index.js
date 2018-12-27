import './prismjs';
import './bootstrap-vue';
import './vue-codemirror';
import './vue-runtime-template';
import './data-template-wrapper';
import './code-mirror-themes';
import './theme-picker';
import './data-visualization';
import Vue from 'vue'
import VueHighlightJS from 'vue-highlightjs'

// Tell Vue.js to use vue-highlightjs
Vue.use(VueHighlightJS)
import 'highlight.js/styles/vs2015.css';