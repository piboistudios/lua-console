<template lang="pug">
    .data-visualizations
        template(v-for="(data, index) in evaluations")
            .d-flex.border-bottom.justify-content-between
                p.row.h3 Result # {{ index + 1}}
                b-form-group.w-50(
                    horizontal
                    label-cols="6"
                    label="Visualization Type"
                    description="Select a data visualization"
                )
                    b-select(:options="options" v-model="mainDataVisualizations[index]")
            .d-block
                v-data-template-wrapper(:id="`data-visualization-${index}`" :data="data" :template="getTemplate(index)" :all-data="evaluations")
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
export default {
  props: {
    options: Array
  },
  computed: {
    ...mapGetters(["mainDataVisualizations", "evaluations"]),
    ...mapMutations(["setMainDataVisualizations"])
  },
  methods: {
    getTemplate(index) {
      if (
        this.mainDataVisualizations.length - 1 >= index &&
        this.mainDataVisualizations[index]
      ) {
        return this.mainDataVisualizations[index];
      } else {
        return this.options[0].value;
      }
    }
  }
};
</script>


<style lang="scss">
.data-visualizations > .d-block {
  max-height: 80vh !important;
  overflow-y: auto;
}
</style>
