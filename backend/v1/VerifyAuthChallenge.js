export const handler = async (event) => {
    console.log("VerifyAuthChallenge Triggered:", JSON.stringify(event));
  
    const expectedAnswer = event.request.privateChallengeParameters.answer;  // Stored OTP
    const userAnswer = event.request.challengeAnswer;  // User-provided OTP
  
    console.log(`Expected OTP: ${expectedAnswer}, User OTP: ${userAnswer}`);
  
    if (userAnswer === expectedAnswer) {
        console.log("✅ OTP Verified Successfully!");
        event.response.answerCorrect = true;
    } else {
        console.log("❌ Incorrect OTP");
        event.response.answerCorrect = false;
    }
  
    return event;
  };
  