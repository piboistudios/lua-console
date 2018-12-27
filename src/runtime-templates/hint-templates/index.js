export default {
    hidden: "<b-container hidden/>",
    default: `<b-container >
    <b-card class="bg-light w-100 above-all" bg-variant="dark" header-class="py-0" body-class="py-0">
      <p class="text-light my-1" slot="header" v-html="hintContent.header"/>
      <p class="text-light my-1" v-html="hintContent.body" />
    </b-card>
  </b-container>`
  
}