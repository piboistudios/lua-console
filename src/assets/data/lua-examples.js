export default {
    default: `-- start your session 
    @start
    
-- request some data into your session
    @request
      function where(customer)
        return customer.Credits > 2500
      end
      set = "decentCustomers"
    
-- do something with your data
    @do
      retVal = {}
      index = 0
      repeat
        retVal[index] = decentCustomers[index]
        index = index + 1
      until index == 10
      return unpack{retVal}`,
    products: `	    @start
    -- Request type of (Product, Customer, Warehouse, Order, Invoice, LineItem, Supplier, Employee, Address)	
        @request(Product)
          function where(product)
            return product.UnitPrice < 50
          end
          set = "products"
        @do
          return products`,
    "chained evaluations": `	    @start
    -- Request type of (Product, Customer, Warehouse, Order, Invoice, LineItem, Supplier, Employee, Address)	
        @request(Product)
          function where(product)
            return product.UnitPrice < 1000
          end
          set = "expensiveProducts"
		@do
		  return expensiveProducts
        @request(Customer)
		  function where(customer)
			return customer.Credits >= 1000
		  end
		  set = "customersWhoCanAffordThem"
		@do
		  return customersWhoCanAffordThem
		@request(Customer)
		  function where(customer)
			return customer.Name[1] == 'C' and customer.Credits >= 1000
		  end
		  set = "customersWhoCanAffordThemWhoseNamesStartWithC"
		@do
		  return customersWhoCanAffordThemWhoseNamesStartWithC
            `,
            relational: `-- start your session 
            @start 
                @keepalive
            --  request some data into your session
               @request
                 function where(customer)
                   return customer.Credits > 2500
                 end
                 set = "decentCustomers"
                @request(Order)
                  function where(order)
                    function predicate(customer)
                      return customer.ID == order.CustomerID
                    end
                    return decentCustomers:Where(predicate) ~= nil
                  end
                  set = "relatedOrders"
                @request(LineItem)
                  function where(lineItem)
                    function predicate(order)
                      return order.ID == lineItem.OrderID
                    end
                    return relatedOrders:Where(predicate) ~= nil
                  end
                  set = "lineItems"
                @do
                  customer = decentCustomers.value[4]
                  local predicate = function (order)
                    return order.CustomerID == customer.ID
                  end
                  customerOrders = relatedOrders:Where(predicate)
                  customersFirstOrder = customerOrders[1]
                  predicate = function (lineItem)
                    return lineItem.OrderID == customersFirstOrder.ID
                  end
                  firstOrderLineItems = lineItems:Where(predicate)
                  return customer, customersFirstOrder, firstOrderLineItems
                    `
      
}