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
    ItemName,
    id
  } = data;
  let queryText;

  queryText = `


  INSERT INTO transactions(
      uuid,
      CustomerID, 
      SupplierID,
      Facebook,
      Price,
      Category,
      Grams,
      Status,
      Modified_By,
      ItemName,
      proof_of_payment
 )
        VALUES (
        '${id}',
       '${CustomerID}',
       '${SupplierID}',
       '${Facebook}',
       '${Price}',
       '${Category}',
       '${Grams}',
       'IN_PROGRESS',
       '${adminUserID}',
        '${ItemName}',
        ''
              
)

  `;

  return queryText;
};

export const getOrderList = (customerId, transactionId) => {
  let queryText;

  queryText = `
SELECT *
FROM transactions


LEFT JOIN customer_record ON transactions.CustomerID = customer_record.CustomerID


${customerId ? `where transactions.CustomerID = '${customerId}'` : ``}


${transactionId ? `AND transactions.transactionId = '${transactionId}'` : ``}




  `;

  console.log(queryText);
  return queryText;
};

export const updateOrder = (transactionId, status, proof_of_payment) => {
  let queryText;

  queryText = `
UPDATE transactions 
SET 

status = '${status}' ,
proof_of_payment  = '${proof_of_payment}' 

WHERE TransactionID = '${transactionId}' LIMIT 1

  `;

  return queryText;
};

export const adminupdateOrder = (transactionId, status, comments) => {
  let queryText;

  queryText = `
UPDATE transactions 
SET 

status = '${status}' ,
admin_comments = '${comments}'

WHERE TransactionID = '${transactionId}' LIMIT 1

  `;

  return queryText;
};
