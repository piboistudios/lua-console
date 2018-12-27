import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
Vue.use(Vuex)
const apiBase = "http://localhost:8096/Lua";
import LuaExamples from '@assets/data/lua-examples.js';
export default new Vuex.Store({
  state: {
    sessionID: null,
    code: LuaExamples.default,
    meta: {

    },
    state: {

    },
    previousScripts: [],
    evaluations: null,

    Output: {
      msg: "",
      variant: ""
    },
    theme: "isotope",
    view: {
      main: {
        dataVisualizations: []
      }
    }
  },
  getters: {
    meta(state) {
      return state.meta;
    },
    state(state) {
      return state.state;
    },
    evaluations(state) {
      return state.evaluations;
    },
    Output(state) {
      return state.Output;
    },
    theme(state) {
      return state.theme;
    },
    mainDataVisualizations(state) {
      return state.view.main.dataVisualizations;
    },
    code(state) {
      return state.code;
    },
    previousScripts(state) {
      return state.previousScripts;
    }
  },
  mutations: {

    mergeMeta(state, payload) {
      state.meta = Object.assign(state.meta, payload);
    },
    mergeState(state, payload) {
      state.state = Object.assign(state.state, payload);
    },
    setSessionID(state, payload) {
      state.sessionID = payload;
    },
    setEvaluations(state, payload) {
      state.evaluations = payload;
    },
    addEvaluation(state, payload) {
      if (!state.evaluations) state.evaluations = [];
      if (state.evaluations instanceof Array) {
        state.evaluations.push(payload);
      }
    },
    refreshEvaluations(state) {
      state.evaluations = null;
    },
    doOutput(state, payload) {
      state.Output = payload;
    },
    success(state, payload) {
      state.Output = {
        msg: payload,
        variant: "success",
      };
    },
    error(state, payload) {
      state.Output = {
        msg: payload,
        variant: "danger"
      }
    },
    warn(state, payload) {
      state.Output = {
        msg: payload,
        variant: "warning",
      }
    },
    info(state, payload) {
      state.Output = {
        msg: payload,
        variant: "info"
      }
    },
    setTheme(state, payload) {
      state.theme = payload;
    },
    setMainDataVisualizations(state, { index, value }) {
      if (index) {
        state.view.main.dataVisualizations[index] = value;
      }
      else state.view.main.dataVisualizations = value;
    },
    setCode(state, code) {
      state.code = code;
    },
    addScriptToHistory(state, script) {
      state.previousScripts.push(script);
      if (state.previousScripts.length > 25) {
        state.splice(0, 1);
      }
    },
    refreshScriptHistory(state) {
      state.previousScripts = [];
    }


  },
  actions: {
    startSession({ commit }) {
      return new Promise((resolve, reject) => {

        axios.post(`${apiBase}/StartSession`)
          .then(response => {
            commit("setSessionID", response.data.Data);
            commit("success", `Session started (ID: ${response.data.Data})`);
            resolve(response);
          })
          .catch(error => {
            console.error(error);
            commit("error", "Unable to start session.");
            reject(error);
          });
      })
    },
    closeSession({ commit, state }) {
      console.log({ state });
      if (state.sessionID === null) return;
      return new Promise((resolve, reject) => {
        axios.post(`${apiBase}/CloseSession`, {
          sessionID: state.sessionID
        })
          .then(response => {
            if (response.data.Code === 200) {
              resolve(true);
              commit("setSessionID", null);

            } else {
              resolve(false);
            }
          }).catch(err => {
            console.error(error);
            commit("error", error);
            resolve(error);
          });
      })

    },
    requestState({ commit, state }, { script, type }) {
      if (state.sessionID === null || !script || !type) return;
      const { sessionID } = state;
      return new Promise((resolve, reject) => {
        axios.post(`${apiBase}/RequestState`, {
          sessionID,
          script,
          type
        })
          .then(response => {
            const { Data } = response.data;
            const { meta, data, statePath } = Data;
            const metaVal = {};
            metaVal[statePath] = meta;
            commit("mergeState", data);
            commit("mergeMeta", metaVal);
            commit("success", "State request approved");
            resolve(response);
          })
          .catch(error => {
            console.error(error);
            commit("error", "Unable to update state");
            resolve(error);
          });
      })
    },
    doScript({ commit, state }, script) {
      if (state.sessionID === null) return;
      return new Promise((resolve, reject) => {

        const { sessionID } = state;
        axios.post(`${apiBase}/REPL`, {
          sessionID,
          script
        })
          .then(response => {
            const { data } = response;
            if (data.Code > 399) {
              commit("error", `${data.Message}`)
              reject(data);
              return;
            }
            commit("success", "Script successfully evaluated");
            if (data instanceof Array) {
              if (data.length === 1) {
                let dataToEvaluate = data[0];
                if (dataToEvaluate.Keys instanceof Array && dataToEvaluate.Values instanceof Array) {
                  const evaluation = {};
                  dataToEvaluate.Keys.forEach((key, index) => {
                    evaluation[key] = dataToEvaluate.Values[key];
                  });
                  commit("addEvaluation", evaluation);
                } else {

                  commit("addEvaluation", dataToEvaluate);
                }
              } else {
                data.forEach(result => {
                  commit("addEvaluation", result);
                })
              }
            } else {

              commit("addEvaluation", response.data);
            }
            resolve(response);
          })
          .catch(error => {
            console.error(error);
            commit("error", "Failed to evaluate script");
          });
      })
    }
  }
})
