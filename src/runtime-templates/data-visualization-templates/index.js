export default {
    default: "<pre>{{data}}</pre>",
    "records-table": `
    <b-table
     :items="data.map(record => Object.assign(record, {
       ModifiedDate: format('date', record.ModifiedDate, 'MM-DD-YYYY'),
       EnteredDate: format('date', record.EnteredDate, 'MM-DD-YYYY')
      })
     )
     "
     head-variant='dark'
     striped
     hover
    />
  `,
  "kvp-tables":`
  <b-table
    v-for="dataObject in data"
    class="text-left"
    tbody-class="text-left"
    :items="
      Object.keys(
        dataObject
      ).map(
        key => ['ModifiedDate','EnteredDate'].indexOf(key) < 0 ? 
          ({key, value: dataObject[key]}) :
          ({key, value: format('date', dataObject[key], 'MM-DD-YYYY')})
        )
    "
    head-variant="dark"
    striped
    hover
  
  />`,
  
}