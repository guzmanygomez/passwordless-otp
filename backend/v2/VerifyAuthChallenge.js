import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider'
const cognito = new CognitoIdentityProvider();

export const handler = async (event) => {
    console.log("VerifyAuthChallenge Triggered:", JSON.stringify(event));
  
    const challenge = event.request.challengeName;
    const userPoolId = event.userPoolId;
    const userName = event.userName;
  
    if (challenge === 'CUSTOM_CHALLENGE') {
        const correct = event.request.privateChallengeParameters.answer;
        const given = event.request.challengeAnswer;

        if (given === correct) {
            await cognito.adminUpdateUserAttributes({
                    UserPoolId: userPoolId,
                    Username: userName,
                    UserAttributes: [
                    { Name: 'phone_number_verified', Value: 'true' }
                    ]
                }).promise();

            event.response.answerCorrect = true;
        } else {
            event.response.answerCorrect = false;
        }
    }

    if (challenge === 'COLLECT_ATTRIBUTES') {
        try {
            const data = JSON.parse(event.request.challengeAnswer || '{}');
            const { name, email } = data;

            if (!name || !email) {
                throw new Error("Missing name or email");
            }
            

            await cognito.adminUpdateUserAttributes({
                    UserPoolId: userPoolId,
                    Username: userName,
                    UserAttributes: [
                    { Name: 'name', Value: name },
                    { Name: 'email', Value: email },
                    { Name: 'email_verified', Value: 'true' }
                    ]
                }).promise();

            event.response.answerCorrect = true;
        } catch (err) {
            console.error("Failed to parse attributes:", err);
            event.response.answerCorrect = false;
        }
    }
  
    return event;
  };
  