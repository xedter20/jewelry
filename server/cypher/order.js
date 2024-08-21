import util from 'util';

export const createOrder = data => {
  let {
    CustomerID,
    Facebook,
    Category,
    SupplierID,
    Grams,
    Price,
    adminUserID,
    ItemName
  } = data;
  let queryText;

  queryText = `


  INSERT INTO transactions(
      CustomerID, 
      SupplierID,
      Facebook,
      Price,
      Category,
      Grams,
      Status,
      Modified_By,
      ItemName
 )
        VALUES (
       '${CustomerID}',
       '${SupplierID}',
       '${Facebook}',
       '${Price}',
       '${Category}',
       '${Grams}',
       'IN_PROGRESS',
       '${adminUserID}',
           '${ItemName}'
              
)

  `;

  return queryText;
};

export const getOrderList = () => {
  let queryText;

  queryText = `
SELECT *
FROM transactions
LEFT JOIN customer_record ON transactions.CustomerID = customer_record.CustomerID


  `;

  return queryText;
};
