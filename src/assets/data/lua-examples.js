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
        retVal[index] = decentCustomers.value[index]
        index = index + 1
      until index == 10
      return unpack(retVal)`,
    products: `	    @start
    -- Request type of (Product, Customer, Warehouse, Order, Invoice, LineItem, Supplier, Employee, Address)	
        @request(Product)
          function where(product)
            return product.UnitPrice < 50
          end
          set = "products"
        @do
          return products.value`,
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
				@do
				  customer = decentCustomers.value[1]
				  function predicate(order)
					return order.CustomerID == customer.ID
				  end
				  firstCustomersOrders = relatedOrders:Where(predicate)
				  return firstCustomersOrders, customer
                    `
      
}