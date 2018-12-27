<template lang="pug">

    .d-flex.justify-content-between.my-2
        b-form-group.w-25(
          horizontal
          label-cols="6"
          label="Editor Theme"
          label-for="theme-picker"
        )
          b-select#theme-picker(
            :value="theme" 
            @input="setTheme"
            :options="themeOptions"
          )
        b-form-group.w-25(
          horizontal
          label-cols="6"
          label="Code Examples"
          label-for="theme-picker"
        )
          b-select#theme-picker(
            :value="exampleChosen" 
            @input="SetCode"
            :options="codeExamples"
          )
</template>

<script>
import { mapMutations, mapGetters } from "vuex";
import LuaExamples from "@assets/data/lua-examples.js";

export default {
  props: {
    themeOptions: Array,
    codeExamples : Array,
  },
  computed: {
    ...mapGetters(["theme"])
  },
  methods: {
    ...mapMutations(["setTheme", "setCode"]),
    SetCode(code) {
      this.exampleChosen = code;
      this.setCode(code);
    }
  },
  data() {
    return {
      exampleChosen: "",
    };
  }
};
</script>

