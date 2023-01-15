

import {ExpenseAPI} from "./ExpenseAPI";
import { getExpense } from "./GmailFunctions";

const path = require('path');
const processVar = require('process');
const {authenticate}  = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const fs = require('fs').promises;

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(processVar.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(processVar.cwd(), '../credentials/credentials_finance_desktop.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client: any) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listLabels(auth: any) {
  const gmail = google.gmail({version: 'v1', auth});
  

  let  res;

  // 1670336683000
  
  // let latestMailId = mailIdList[0];
  // let latestMailId = '184dcd69f8dd24bc'; // credit
  // let latestMailId = '184e5b17d09c1ebf'; // UPI
  // let latestMailId = '184e45269f530c10'; // E-mandate
  // let latestMailId = '184e59fd5d755b34';

  // res = await gmail.users.messages.get({
  //   userId: 'me',
  //   id: latestMailId
  // });


  // console.log(res.data);




  let temp = Date.now()/1000;
  let updateStartTime = Math.trunc(temp);
  let lastUpdateStartTime;

  await ExpenseAPI.getUpdatedTime()
  .then(response => lastUpdateStartTime = response);

  // console.log('after:' + lastUpdateStartTime);

  // lastUpdateStartTime = '1670336683'

  res = await gmail.users.messages.list({
    userId: 'me',
    q: 'after:' + lastUpdateStartTime
  });

  // console.log(res.data);

  if(res.data.resultSizeEstimate === 0){
    ExpenseAPI.updateTime(updateStartTime.toString());
    console.log("\n\n\n\n");
    return;
  }


  //@ts-ignore
  let mailIdList = res.data.messages.map((res) => res.id);

  console.log(mailIdList);

  


  // let CREDIT_CARD_MSG = 'Dear Card Member, Thank you for using your HDFC Bank Credit Card '+
  // 'ending 8566 for Rs 283.00 at EATCLUBBRANDSPRIVATELI on 04-12-2022 16:42:34.'+
  // ' After the above transaction'
  let CREDIT_CARD_MSG = 'Dear Card Member, Thank you for using your HDFC Bank Credit Card '+
  'ending 8566 for Rs XX1 at XX2 on XX3 XX4'+
  ' After the above transaction';

  // let UPI_MSG = 'Dear Customer, Rs.20.00 has been debited from account **1811 to VPA ' + 
  // 'paytmqr2810050501011u8l4cw7fokm@paytm on 06-12-22. Your UPI transaction reference number' + 
  // ' is 234006737725. Please call on 18002586161'
  let UPI_MSG = 'Dear Customer, XX1 has been debited from account **1811 to VPA ' + 
  'XX2 on 06-12-22. Your UPI transaction reference number' + 
  ' is 234006737725. Please call on 18002586161'


  let expenseList = [];

  for (const mailInex in mailIdList) {

    // console.log(mailInex);

    res = await gmail.users.messages.get({
      userId: 'me',
      id: mailIdList[mailInex]
    });
  
  
    let snippet  = res.data.snippet
  
  
  
    if(snippet.includes('E-mandate')){
      console.log('-> E-mandate mail');
    }
    
    else if(snippet.includes('Thank you for using your HDFC Bank Credit Card ending 8566')){
  
      let CREDIT_CARD_MSG_SPLIT = CREDIT_CARD_MSG.split(' ');
      let SNIPPET_SPLIT = snippet.split(' ');
  
      let rsIndex = CREDIT_CARD_MSG_SPLIT.indexOf('XX1');
      let vendorIndex = CREDIT_CARD_MSG_SPLIT.indexOf('XX2');
  
      let eJson = {
        date: parseInt(res.data.internalDate)
      }
  
      let expense = getExpense(eJson);
  
      expense.cost = SNIPPET_SPLIT[rsIndex]
      expense.vendor = SNIPPET_SPLIT[vendorIndex]

      expenseList.push(expense);

      console.log('-> Credit card: ', expense.cost);

    }
  
    else if(snippet.includes('Your UPI transaction')){
      
      let UPI_MSG_SPLIT = UPI_MSG.split(' ');
      let SNIPPET_SPLIT = snippet.split(' ');
  
      let rsIndex = UPI_MSG_SPLIT.indexOf('XX1');
      let vendorIndex = UPI_MSG_SPLIT.indexOf('XX2');
  
      let eJson = {
        date: parseInt(res.data.internalDate)
      }
  
      let expense = getExpense(eJson);
  
      expense.cost = SNIPPET_SPLIT[rsIndex].replace('Rs.', '')
      expense.vendor = SNIPPET_SPLIT[vendorIndex]

      expenseList.push(expense);

      console.log('-> UPI trans: ', expense.cost);

    }
  
  }

  console.log("Final expense list -> ", expenseList.length);
    
  
  ExpenseAPI.addExpenses(updateStartTime.toString(), expenseList)
  .then(response => console.log("Updated records -> ", response.length));

  ExpenseAPI.getUpdatedTime()
  .then(response => console.log("Updated timestamp -> ", response));


  console.log("\n\n\n\n");

  
}


authorize().then(listLabels).catch(console.error);


// setInterval(() => authorize().then(listLabels).catch(console.error), 500000);
