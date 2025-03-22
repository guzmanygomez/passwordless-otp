import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "ap-southeast-2_NySM3fgDT",  // Replace with your Cognito User Pool ID
  ClientId: "1h86tkcpeid178uednp0crvluv",   // Replace with your Cognito App Client ID
};

const userPool = new CognitoUserPool(poolData);

export default userPool;
