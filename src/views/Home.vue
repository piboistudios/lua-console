<template lang="pug">
  b-container(fluid)
    b-row.bg-dark
      p.h3.text-light .NET Lua Console
    lua-console
</template>

<script>
// @ is an alias to /src

export default {
  name: "home",
  components: {
    LuaConsole: () =>
      import(/*webpackChunkName: 'code_mirror' */

      "../views/LuaConsole.vue")
  }
};
</script>
