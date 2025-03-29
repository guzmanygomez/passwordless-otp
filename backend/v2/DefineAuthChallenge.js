module.exports.handler = async (event) => {
    console.log("DefineAuthChallenge event:", JSON.stringify(event));

    if (event.request.session.length === 0) {
      // First step — user created or found in previous logic
      event.response.issueTokens = false;
      event.response.failAuthentication = false;
      event.response.challengeName = 'CUSTOM_CHALLENGE'; // Send OTP
    } else if (
      event.request.session.length === 1 &&
      event.request.session[0].challengeResult === true
    ) {
      // OTP verified successfully, now collect additional info
      event.response.issueTokens = false;
      event.response.failAuthentication = false;
      event.response.challengeName = 'COLLECT_ATTRIBUTES';
    } else if (
      event.request.session.length === 2 &&
      event.request.session[1].challengeName === 'COLLECT_ATTRIBUTES' &&
      event.request.session[1].challengeResult === true
    ) {
      // Attributes received and stored
      event.response.issueTokens = true;
      event.response.failAuthentication = false;
    } else {
      event.response.issueTokens = false;
      event.response.failAuthentication = true;
    }
  
    console.log("DefineAuthChallenge response:", JSON.stringify(event.response));
    return event;
  };
  