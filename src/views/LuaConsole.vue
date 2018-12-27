 <template lang="pug">
    b-container(fluid)
      b-alert.col-12.row(:variant="Output.variant" v-text="Output.msg" :show="Output.msg.length")
      editor-header(:theme-options="options.theme" :code-examples="options.code")
      v-template#hint(hidden :template="hintTemplate||'<p/>'" ref="hint")
      b-row#main
        b-col
          b-card(no-body)
            b-tabs(card)
              b-tab(active)
                .d-flex.justify-content-between.align-items-center.h5(slot="title")
                  span.font-weight-bold Editor
                  b-badge(variant="primary" pill) Active
                
                codemirror.text-left.h-100(
                    ref="myCm"
                    v-model="Code"
                    :options="CmOptions"
                )
              
              b-tab(v-for="(scriptRecord, index) in History" :key="index" )
                .d-flex.justify-content-between.align-items-center.h5(slot="title")
                  span.font-weight-bold Script # {{ History.length - index }}
                  b-badge(pill :variant="scriptRecord.successful ? 'success' : 'danger'" v-text="scriptRecord.successful ? 'OK' : 'ERROR'")
                
                pre(v-highlightjs="scriptRecord.script")
                  code(class="lua")
            .bg-light(slot="footer")



          
        b-col
          b-card
            p.h3(slot="header") Data Visualization:
            b-container(fluid v-if="evaluations")
              main-data-visualizations(:options="options.template")
</template>

<script>
import Vue from "vue";
import { mapGetters, mapActions, mapMutations } from "vuex";
import axios from "axios";
import TYPE_MAP from "@assets/data/type_map";
import CodeMirrorThemes from "@assets/data/code-mirror-themes";
import "codemirror/mode/lua/lua.js";
import LuaExamples from "@assets/data/lua-examples";
const codeExamples = Object.keys(LuaExamples).map(key => ({
  text: key,
  value: LuaExamples[key]
}));
import RuntimeTemplates from "../runtime-templates";
const flattenPos = pos => pos.ch + (pos.line + 10);
const getProperRange = (pos1, pos2) => {
  const first = flattenPos(pos1) > flattenPos(pos2) ? pos2 : pos1;
  const second = first === pos1 ? pos2 : pos1;
  return [first, second];
};
// theme css
import Prism from "prismjs";

export default {
  data() {
    const vm = this;
    const visualizations = RuntimeTemplates.data_visualizations;
    const hints = RuntimeTemplates.hint;
    return {
      empty: [],
      hintEl: null,
      refreshScriptsNextTime: false,
      options: {
        template: Object.keys(visualizations).map(key => ({
          text: key,
          value: visualizations[key]
        })),
        theme: CodeMirrorThemes.map(theme => ({
          text: theme,
          value: theme
        })),
        code: codeExamples
      },

      hintContent: {
        header: "",
        body: "",
        footer: ""
      },
      hintTemplate: hints.default,
      luaIdentifierChars: /[A-Z_0-9]/i,
      cmOptions: {
        // codemirror options
        tabSize: 4,
        theme: "",
        mode: "text/x-lua",
        lineNumbers: true,
        line: true,
        smartIndent: false,
        indentWithTabs: true,
        extraKeys: {
          "Shift-Tab": function(cm) {
            cm.execCommand("indentLess");
          },
          Tab: function(cm) {
            cm.execCommand("indentMore");
          },
          "Ctrl-Enter": function(cm) {
            vm.evaluateScript();
          },
          "Ctrl-/": function(cm) {
            const ranges = cm.listSelections();
            ranges.forEach(range => {
              console.log(range);
              const ranges = getProperRange(range.head, range.anchor);
              const [lineStart, lineEnd] = ranges.map(line => line.line);

              for (let line = lineStart; line < lineEnd + 1; line++) {
                const commentCursor = [{ ch: 0, line }, { ch: 3, line }];
                console.log({ commentCursor });
                cm.setSelection(commentCursor[0], commentCursor[1]);
                const selection = cm.getSelection();

                selection === "-- "
                  ? cm.replaceSelection("  ")
                  : selection === "   "
                  ? cm.replaceSelection("-- ")
                  : selection.slice(0, 2) === "--"
                  ? cm.replaceSelection(selection.slice(2))
                  : cm.replaceSelection(`--${selection}`);
              }
              cm.setSelection(ranges[0], ranges[1]);
            });
          }
        }
        // more codemirror options, 更多 codemirror 的高级配置...
      }
    };
  },
  methods: {
    ...mapActions(["startSession", "requestState", "doScript", "closeSession"]),
    ...mapMutations([
      "refreshEvaluations",
      "doOutput",
      "setTheme",
      "setCode",
      "addScriptToHistory",
      "refreshScriptHistory"
    ]),

    error(msg) {
      this.doOutput({ msg, variant: "danger" });
    },
    warn(msg) {
      this.doOutput({ msg, variant: "warning" });
    },
    evaluateScript() {
      const scriptBlocks = this.examineScript();
      const { Code } = this;
      console.log({ scriptBlocks });
      if (
        scriptBlocks &&
        scriptBlocks.find(scriptBlock =>
          /(start|request|do)/.test(scriptBlock.command)
        )
      ) {
        this.refreshEvaluations();
        let keepAlive = false;
        let nextRequestType = 1;
        let scriptSuccessful = true;

        scriptBlocks
          .concat([{ command: "tryclosesession" }])
          .reduce((promise, scriptBlock) => {
            const request = (type = 1) => {
              return this.requestState({
                script: scriptBlock.script,
                type
              });
            };

            return promise
              .then(prev => {
                console.log("Executing", scriptBlock.command, { prev });
                switch (scriptBlock.command) {
                  case "start":
                    return this.startSession();
                  case "request":
                    console.log(
                      "TYPE_MAP",
                      TYPE_MAP[scriptBlock.args],
                      scriptBlock
                    );
                    return request(TYPE_MAP[scriptBlock.args]);
                  case "do":
                    return this.doScript(scriptBlock.script);
                  case "keepalive":
                    keepAlive = true;
                    if (this.refreshScriptsNextTime) {
                      this.refreshScriptHistory();
                      this.refreshScriptsNextTime = false;
                    }

                    return Promise.resolve();
                  default:
                    this.addScriptToHistory({
                      script: Code,
                      successful: scriptSuccessful
                    });
                    if (!keepAlive) {
                      this.closeSession();
                      this.refreshScriptsNextTime = true;
                    }
                    return Promise.resolve();
                }
              })
              .catch(error => {
                scriptSuccessful = false;
                Promise.reject(error);
              });
          }, Promise.resolve());
      } else {
        this.error("Command unrecognized.");
      }
    },
    examineScript() {
      const { Code } = this;
      let meta_key = /^\s*@([\w]+)(\(.+\))?\s*$/gim;
      const matches = meta_key.test(Code);
      meta_key = /^\s*@([\w]+)(\(.+\))?\s*$/gim;
      const scriptBlocks = [];
      if (matches) {
        let match = null;
        const meta_positions = [];
        while ((match = meta_key.exec(Code)) !== null) {
          console.log({ match });
          meta_positions.push({
            index: match.index,
            match: match[1],
            meta: match[2] ? match[2].slice(1, match[2].length - 1) : null,
            commandLength: match[0].length
          });
        }
        meta_positions.push(null);
        meta_positions.forEach((position, index) => {
          if (position === null) return;
          const nextEntry = meta_positions[index + 1];
          const nextPosition =
            nextEntry !== null ? nextEntry.index : Code.length;
          scriptBlocks.push({
            command: position.match,
            args: position.meta,
            script: Code.slice(
              position.index + position.commandLength,
              nextPosition
            )
          });
        });
        return scriptBlocks;
      } else {
        this.error("At least one @request or @do command must be executed");
        return null;
      }
    },
    onCmReady(cm) {
      console.log("the editor is readied!", cm);
    },
    onCmFocus(cm) {
      console.log("the editor is focus!", cm);
    },
    onCmCodeChange(newCode) {
      console.log("this is new code", newCode);
      this.Code = newCode;
    },
    showHint(hintTemplate, hintContent, cm, pos) {
      !this.hintEl && (this.hintEl = document.createElement("div"));
      this.hintTemplate = hintTemplate;
      this.hintContent.header = hintContent.header;
      this.hintContent.body = hintContent.body;
      this.hintContent.footer = hintContent.footer;
      this.$nextTick(() => {
        this.hintEl.innerHTML = this.hint.$el.innerHTML;
        this.hintEl.hidden = false;
        cm.addWidget(pos, this.hintEl, true);
      });
    },
    hideHint() {
      this.hintEl && (this.hintEl.hidden = true);
    }
  },
  computed: {
    ...mapGetters([
      "state",
      "meta",
      "evaluations",
      "Output",
      "theme",
      "code",
      "previousScripts"
    ]),
    History() {
      Prism.highlightAll();
      return this.previousScripts.reverse();
    },
    Code: {
      get: function() {
        return this.code;
      },
      set: function(newValue) {
        this.setCode(newValue);
      }
    },
    HasHint() {
      return this.hintTemplate.length;
    },
    codemirror() {
      return this.$refs.myCm.codemirror;
    },
    hint() {
      return this.$refs.hint;
    },
    CmOptions() {
      const { theme } = this;
      // console.log({ theme });
      return Object.assign(this.cmOptions, { theme });
    }
  },
  mounted() {
    console.log("this is current codemirror object", this.codemirror);
    this.codemirror.on("beforeSelectionChange", (cm, changes) => {
      console.log({ cm });
      const range = changes.ranges[0];

      const [first, second] = getProperRange(range.anchor, range.head);
      // console.log(
      //   cm.getTokenAt(first),
      //   cm.getTokenAt(second),
      //   cm.getLineTokens(first.line),
      //   cm.getLineTokens(second.line)
      // );
      let cursorToken = cm.getTokenAt(second);
      this.hideHint();
      if (cursorToken.type !== "variable") return;
      const lineTokens = cm.getLineTokens(second.line);
      const lineTokensAtAndBeforeCursor = lineTokens.slice(
        0,
        lineTokens.findIndex(token => token.start === cursorToken.start)
      );
      let dotNotationFlag = false;
      let bracketNotationFlag = false;
      let bracketNotationClosedFlag = false;
      let bracketNotationSatisfiedFlag = false;
      let parentNotationFlag = false;
      let variableToken = null;
      let hintFound = false;
      const metaKeys = Object.keys(this.meta);
      lineTokensAtAndBeforeCursor.reverse().forEach(token => {
        if (token.string === ".") dotNotationFlag = true;
        if (token.string === "(") parentNotationFlag = true;
        if (token.string === "]") bracketNotationFlag = true;
        if (bracketNotationFlag && !bracketNotationSatisfiedFlag) {
          if (token.string === "[") {
            bracketNotationClosedFlag = true;
          }
        }
        if (token.type === "variable") {
          if (parentNotationFlag) {
            cursorToken = token;
            parentNotationFlag = false;
            dotNotationFlag = false;
            bracketNotationClosedFlag = false;
          } else if (dotNotationFlag || bracketNotationClosedFlag) {
            const { meta } = this;
            console.log("TOKEN", { token, cursorToken, meta });
            if (metaKeys.find(key => key === token.string)) {
              const metaVal = meta[token.string][cursorToken.string];
              if (!metaVal) return;
              hintFound = true;
              this.showHint(
                this.hintTemplate,
                {
                  header: metaVal.title,
                  body: metaVal.content
                },
                cm,
                second
              );
              bracketNotationSatisfiedFlag = true;
              bracketNotationClosedFlag = false;
              parentNotationFlag = false;
            }
          }
        }
        dotNotationFlag = false;
      });
      if (!hintFound) this.hideHint();
      // you can use this.codemirror to do something...
    });
  }
};
</script>
<style>
#main {
  min-height: 80vh;
}
.CodeMirror {
  border: 1px solid #eee !important;
  height: 100% !important;

  overflow-y: auto;
}
.CodeMirror-scroll {
  min-height: 128px !important;
}
.pre {
  max-height: 80vh;
  overflow-y: auto;
}
.above-all {
  z-index: 9999 !important;
}
</style>