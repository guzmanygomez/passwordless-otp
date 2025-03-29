module.exports.handler = async (event) => {
    console.log("DefineAuthChallenge event:", JSON.stringify(event));
  
    // Ensure response object exists
    event.response = event.response || {};
  
    if (event.request.session.length === 0) {
      // First-time login: Issue OTP challenge
      event.response.challengeName = "CUSTOM_CHALLENGE";
      event.response.issueTokens = false;
      event.response.failAuthentication = false;
    } else if (
      event.request.session.length > 0 &&
      event.request.session.slice(-1)[0].challengeResult === true
    ) {
      // If the last challenge was successful, issue tokens
      event.response.issueTokens = true;
      event.response.failAuthentication = false;
    } else {
      // If OTP is wrong, fail authentication
      event.response.issueTokens = false;
      event.response.failAuthentication = true;
    }
  
    console.log("DefineAuthChallenge response:", JSON.stringify(event.response));
    return event;
  };
  