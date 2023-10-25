const generatePolicy = (principalId, effect, resource) => {
    return {
      principalId: principalId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: effect,
            Resource: resource,
          },
        ],
      },
    };
  };
  
  module.exports.basicAuthorizer = async (event) => {
    try {
      const authHeader = event.headers.Authorization;
  
      if (!authHeader) {
        return {
          statusCode: 401,
          body: 'Authorization header is missing',
        };
      }
  
      const encCredentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(encCredentials, 'base64').toString('ascii');
      const [username, password] = credentials.split(':');
  
      // Verifica si el usuario existe en el archivo .env
      const envPassword = process.env[username];
  
      if (!envPassword) {
        return {
          statusCode: 403,
          body: 'Access denied: Invalid username',
        };
      } else if (envPassword === password) {
        return {
          statusCode: 200,
          body: JSON.stringify(generatePolicy(username, 'Allow', event.methodArn)),
        };
      } else {
        return {
          statusCode: 403,
          body: 'Access denied: Invalid credentials',
        };
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Internal Server Error',
        }),
      };
    }
  };
  