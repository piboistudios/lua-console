<template lang="pug">
    v-template(:template="`<div>${template}</div>`")
</template>


<script>
import numeral from "numeral";
import moment from "moment";
const format = (formatType, val, format) => {
  if (formatType === "date") {
    return moment(val).format(format);
  } else {
    return numeral(val).format(format);
  }
};
export default {
  props: {
    data: Object | Array,
    allData: Object | Array,
    template: String
  },
  data() {
    return {
      format
    };
  }
};
</script>
