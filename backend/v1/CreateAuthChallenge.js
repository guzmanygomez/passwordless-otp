import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: "ap-southeast-2" });

export const handler = async (event) => {
    console.log("CreateAuthChallenge Triggered:", JSON.stringify(event));

    const phoneNumber = event.request?.userAttributes?.phone_number || event.userName;
    if (!phoneNumber) {
      console.error("Missing phone number");
      throw new Error("Missing phone number");
  }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const params = {
        Message: `Your OTP Code is: ${otp}`,
        PhoneNumber: phoneNumber,
    };

    try {
        await snsClient.send(new PublishCommand(params));
        console.log(`OTP Sent to ${phoneNumber}: ${otp}`);
    } catch (error) {
        console.error("SNS Error:", error);
        throw new Error(`SNS Error: ${error.message}`);
    }

     // ✅ FIX: set fields on event.response
  event.response.publicChallengeParameters = {
    phoneNumber: phoneNumber
  };
  event.response.privateChallengeParameters = {
    answer: otp
  };
  event.response.challengeMetadata = "CUSTOM_CHALLENGE";

  return event;
};