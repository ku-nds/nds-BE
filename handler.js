import serverless from 'serverless-http';
import app from './server.js'; 

export const handler = serverless(app);

// exports.hello = async (event) => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify({
//       message: "Go Serverless v4! Your function executed successfully!",
//     }),
//   };
// };

export const hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Go Serverless v4! Your function executed successfully!",
      path: event.rawPath 
    }),
  };
};